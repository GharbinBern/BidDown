import express from 'express';
import { body, validationResult, query } from 'express-validator';
import Job from '../models/Job.js';
import Bid from '../models/Bid.js';
import User from '../models/User.js';
import { authMiddleware, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

const REVIEW_WINDOW_HOURS = 48;

const autoCloseExpiredOpenJobs = async () => {
  const now = new Date();
  await Job.updateMany(
    { status: 'open', deadline: { $lt: now } },
    { $set: { status: 'closed', updatedAt: now } }
  );
};

const toObjectIdString = (value) => value?.toString?.() || '';

const getWinningBid = async (job) => {
  if (!job?.winning_bid_id) return null;
  return Bid.findById(job.winning_bid_id).populate('seller_id', 'name avatar average_rating');
};

const resolveParticipantContext = async (job, userId) => {
  const winningBid = await getWinningBid(job);
  if (!winningBid) {
    return {
      winningBid: null,
      isBuyer: false,
      isSeller: false,
    };
  }

  const buyerId = toObjectIdString(job.owner_id);
  const sellerId = toObjectIdString(winningBid.seller_id?._id || winningBid.seller_id);

  return {
    winningBid,
    isBuyer: buyerId === userId,
    isSeller: sellerId === userId,
  };
};

const finalizeJobPayment = async (job, reason) => {
  const now = new Date();
  job.escrow_released = true;
  job.payment_released_at = now;
  job.workflow_stage = 'completed';
  job.status = 'completed';
  job.completion_date = now;
  job.updatedAt = now;

  // Keep an audit-style final progress note for important terminal events.
  if (reason) {
    job.progress_updates.push({ message: reason, createdAt: now });
  }

  await job.save();
};

const applyReviewTimeoutIfNeeded = async (job) => {
  if (!job) return { job, autoReleased: false };

  const now = new Date();
  const shouldAutoRelease =
    job.workflow_stage === 'review' &&
    !!job.review_deadline &&
    new Date(job.review_deadline).getTime() <= now.getTime() &&
    !job.dispute_raised &&
    !job.escrow_released;

  if (!shouldAutoRelease) {
    return { job, autoReleased: false };
  }

  await finalizeJobPayment(job, 'Auto-released after 48h buyer review window elapsed.');
  return { job, autoReleased: true };
};

// Create job (auth required)
router.post('/', authMiddleware, [
  body('title').notEmpty(),
  body('description').notEmpty(),
  body('budget').isNumeric({ min: 50 }),
  body('category').isIn(['Design', 'Development', 'Marketing', 'Writing', 'Legal', 'Consulting', 'Other']),
  body('deadline').isISO8601(),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, budget, category, deadline } = req.body;

    const job = new Job({
      title,
      description,
      budget,
      category,
      deadline: new Date(deadline),
      owner_id: req.userId,
      sealed_until: new Date(deadline),
      workflow_stage: 'bidding',
      contract_terms: {
        scope: description,
        deadline: new Date(deadline),
        agreed_price: budget,
      },
    });

    await job.save();

    res.status(201).json(job);
  } catch (err) {
    next(err);
  }
});

// List jobs with filters
router.get('/', optionalAuth, [
  query('category').optional().isIn(['Design', 'Development', 'Marketing', 'Writing', 'Legal', 'Consulting', 'Other']),
  query('status').optional().isIn(['open', 'closed', 'completed']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
], async (req, res, next) => {
  try {
    await autoCloseExpiredOpenJobs();

    const { category, status, page = 1, limit = 20, search } = req.query;

    const filter = { status: status || 'open' };
    if (filter.status === 'open') {
      filter.deadline = { $gte: new Date() };
    }
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const jobs = await Job.find(filter)
      .populate('owner_id', 'name avatar average_rating')
      .populate('winning_bid_id')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Job.countDocuments(filter);

    res.json({
      jobs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
});

// Get job details
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    await autoCloseExpiredOpenJobs();

    const job = await Job.findById(req.params.id)
      .populate('owner_id', 'name avatar average_rating')
      .populate({
        path: 'winning_bid_id',
        populate: { path: 'seller_id', select: 'name avatar average_rating' },
      });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    await applyReviewTimeoutIfNeeded(job);

    // Get bids (if user is owner, show all; otherwise hide sealed bids)
    let bids = [];
    if (req.userId === job.owner_id._id.toString()) {
      // Owner: show all bids
      bids = await Bid.find({ job_id: job._id })
        .populate('seller_id', 'name avatar average_rating')
        .sort({ amount: 1 });
    } else {
      // Non-owner: only show bids if auction is closed
      if (new Date() > job.sealed_until) {
        bids = await Bid.find({ job_id: job._id, status: 'pending' })
          .populate('seller_id', 'name avatar average_rating')
          .sort({ amount: 1 });
      }
    }

    res.json({
      ...job.toObject(),
      bids,
    });
  } catch (err) {
    next(err);
  }
});

// Update job (owner only)
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.owner_id.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ error: 'Cannot update closed job' });
    }

    const { title, description, deadline } = req.body;
    if (title) job.title = title;
    if (description) job.description = description;
    if (deadline) job.deadline = new Date(deadline);

    await job.save();
    res.json(job);
  } catch (err) {
    next(err);
  }
});

// Delete job (owner only, only if open)
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.owner_id.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ error: 'Cannot delete closed job' });
    }

    await Job.findByIdAndDelete(req.params.id);
    await Bid.deleteMany({ job_id: req.params.id });

    res.json({ message: 'Job deleted' });
  } catch (err) {
    next(err);
  }
});

// Accept a bid and close auction
router.post('/:id/close', authMiddleware, async (req, res, next) => {
  try {
    const { bid_id } = req.body;

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.owner_id.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ error: 'Job already closed' });
    }

    const bid = await Bid.findById(bid_id);
    if (!bid || bid.job_id.toString() !== job._id.toString()) {
      return res.status(404).json({ error: 'Bid not found' });
    }

    // Update job and bid
    const acceptedAt = new Date();
    job.status = 'closed';
    job.workflow_stage = 'contract';
    job.winning_bid_id = bid._id;
    job.escrow_amount = bid.amount;
    job.contract_terms = {
      scope: job.description,
      deadline: job.deadline,
      agreed_price: bid.amount,
      buyer_confirmed: false,
      seller_confirmed: false,
      confirmed_at: null,
    };
    job.escrow_released = false;
    job.escrow_deposited_at = null;
    job.work_started_at = null;
    job.work_submitted_at = null;
    job.review_deadline = null;
    job.dispute_raised = false;
    job.dispute_reason = null;
    job.dispute_raised_at = null;
    job.dispute_raised_by = null;
    job.revision_rounds_used = 0;
    job.progress_updates = [];
    job.updatedAt = acceptedAt;
    await job.save();

    bid.status = 'accepted';
    bid.accepted_date = acceptedAt;
    bid.sealed = false;
    await bid.save();

    // Reject other bids
    await Bid.updateMany(
      { job_id: job._id, _id: { $ne: bid._id } },
      { status: 'rejected' }
    );

    res.json({ message: 'Bid accepted', job, bid });
  } catch (err) {
    next(err);
  }
});

// Get workflow state for a job (buyer/seller only)
router.get('/:id/workflow', authMiddleware, async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('owner_id', 'name avatar average_rating')
      .populate({
        path: 'winning_bid_id',
        populate: { path: 'seller_id', select: 'name avatar average_rating' },
      });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const participant = await resolveParticipantContext(job, req.userId);
    if (!participant.isBuyer && !participant.isSeller) {
      return res.status(403).json({ error: 'Only buyer or winning seller can access workflow' });
    }

    const { autoReleased } = await applyReviewTimeoutIfNeeded(job);
    const refreshedJob = autoReleased
      ? await Job.findById(req.params.id)
        .populate('owner_id', 'name avatar average_rating')
        .populate({
          path: 'winning_bid_id',
          populate: { path: 'seller_id', select: 'name avatar average_rating' },
        })
      : job;

    return res.json({
      job: refreshedJob,
      role: participant.isBuyer ? 'buyer' : 'seller',
    });
  } catch (err) {
    next(err);
  }
});

// Contract confirmation by buyer/seller
router.put('/:id/contract', authMiddleware, [
  body('scope').optional().isString().isLength({ min: 10, max: 5000 }),
  body('deadline').optional().isISO8601(),
  body('agreed_price').optional().isNumeric({ min: 50 }),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.workflow_stage !== 'contract') {
      return res.status(400).json({ error: 'Contract can only be edited during contract stage' });
    }

    const participant = await resolveParticipantContext(job, req.userId);
    if (!participant.isBuyer) {
      return res.status(403).json({ error: 'Only buyer can draft contract terms' });
    }

    if (!job.contract_terms) {
      job.contract_terms = {
        scope: job.description,
        deadline: job.deadline,
        agreed_price: job.escrow_amount,
      };
    }

    const nextScope = req.body.scope?.trim();
    const nextDeadline = req.body.deadline ? new Date(req.body.deadline) : null;
    const nextPrice = req.body.agreed_price !== undefined ? Number(req.body.agreed_price) : null;

    if (Number.isFinite(nextPrice)) {
      const winningBid = await Bid.findById(job.winning_bid_id).select('amount');
      if (!winningBid) {
        return res.status(400).json({ error: 'No accepted bid for this job yet' });
      }
      if (nextPrice < winningBid.amount) {
        return res.status(400).json({
          error: `Agreed price cannot be lower than the accepted bid amount (${winningBid.amount})`,
        });
      }
    }

    if (nextScope) job.contract_terms.scope = nextScope;
    if (nextDeadline) job.contract_terms.deadline = nextDeadline;
    if (Number.isFinite(nextPrice)) {
      job.contract_terms.agreed_price = nextPrice;
      job.escrow_amount = nextPrice;
    }

    // Any buyer edit invalidates previous signatures until both reconfirm.
    job.contract_terms.buyer_confirmed = false;
    job.contract_terms.seller_confirmed = false;
    job.contract_terms.confirmed_at = null;
    job.updatedAt = new Date();

    await job.save();

    res.json({
      message: 'Contract terms updated. Both parties must confirm.',
      job,
    });
  } catch (err) {
    next(err);
  }
});

// Contract confirmation by buyer/seller
router.post('/:id/contract/confirm', authMiddleware, async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (!job.winning_bid_id) {
      return res.status(400).json({ error: 'No accepted bid for this job yet' });
    }

    if (job.workflow_stage !== 'contract') {
      return res.status(400).json({ error: 'Contract confirmation is not available in this stage' });
    }

    const participant = await resolveParticipantContext(job, req.userId);
    if (!participant.isBuyer && !participant.isSeller) {
      return res.status(403).json({ error: 'Only buyer or winning seller can confirm contract' });
    }

    if (!job.contract_terms) {
      job.contract_terms = {
        scope: job.description,
        deadline: job.deadline,
        agreed_price: job.escrow_amount,
      };
    }

    if (participant.isBuyer) {
      job.contract_terms.buyer_confirmed = true;
    }
    if (participant.isSeller) {
      job.contract_terms.seller_confirmed = true;
    }

    if (job.contract_terms.buyer_confirmed && job.contract_terms.seller_confirmed) {
      job.contract_terms.confirmed_at = new Date();
      job.workflow_stage = 'escrow';
    }

    job.updatedAt = new Date();
    await job.save();

    res.json({
      message: 'Contract confirmation updated',
      job,
    });
  } catch (err) {
    next(err);
  }
});

// Record escrow funding after buyer payment is confirmed
router.post('/:id/escrow/deposit', authMiddleware, [
  body('payment_intent_id').optional().isString(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const participant = await resolveParticipantContext(job, req.userId);
    if (!participant.isBuyer) {
      return res.status(403).json({ error: 'Only buyer can deposit escrow' });
    }

    if (job.workflow_stage !== 'escrow') {
      return res.status(400).json({ error: 'Escrow deposit is not available in this stage' });
    }

    const now = new Date();
    job.escrow_deposited_at = now;
    job.escrow_released = false;
    job.payment_intent_id = req.body.payment_intent_id || job.payment_intent_id;
    job.workflow_stage = 'in_progress';
    job.updatedAt = now;
    await job.save();

    res.json({
      message: 'Escrow funded. Seller can start work.',
      job,
    });
  } catch (err) {
    next(err);
  }
});

// Seller starts work
router.post('/:id/work/start', authMiddleware, async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const participant = await resolveParticipantContext(job, req.userId);
    if (!participant.isSeller) {
      return res.status(403).json({ error: 'Only winning seller can start work' });
    }

    if (job.workflow_stage !== 'in_progress') {
      return res.status(400).json({ error: 'Work can only be started in progress stage' });
    }

    if (!job.escrow_deposited_at) {
      return res.status(400).json({ error: 'Escrow must be funded before work starts' });
    }

    job.work_started_at = job.work_started_at || new Date();
    job.updatedAt = new Date();
    await job.save();

    res.json({ message: 'Work marked as started', job });
  } catch (err) {
    next(err);
  }
});

// Seller posts optional progress update
router.post('/:id/work/progress', authMiddleware, [
  body('message').notEmpty().isLength({ max: 1500 }),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const participant = await resolveParticipantContext(job, req.userId);
    if (!participant.isSeller) {
      return res.status(403).json({ error: 'Only winning seller can post progress updates' });
    }

    if (job.workflow_stage !== 'in_progress') {
      return res.status(400).json({ error: 'Progress updates are only allowed while work is in progress' });
    }

    job.progress_updates.push({ message: req.body.message.trim(), createdAt: new Date() });
    job.updatedAt = new Date();
    await job.save();

    res.json({ message: 'Progress update posted', job });
  } catch (err) {
    next(err);
  }
});

// Seller submits work for review
router.post('/:id/work/submit', authMiddleware, [
  body('note').optional().isLength({ max: 3000 }),
  body('deliverable_url').optional().isURL(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const participant = await resolveParticipantContext(job, req.userId);
    if (!participant.isSeller) {
      return res.status(403).json({ error: 'Only winning seller can submit work' });
    }

    if (job.workflow_stage !== 'in_progress') {
      return res.status(400).json({ error: 'Work submission is not available in this stage' });
    }

    const now = new Date();
    const deadline = new Date(now.getTime() + REVIEW_WINDOW_HOURS * 60 * 60 * 1000);

    job.work_submitted_at = now;
    job.deliverable_note = req.body.note || '';
    job.deliverable_url = req.body.deliverable_url || '';
    job.review_deadline = deadline;
    job.workflow_stage = 'review';
    job.updatedAt = now;
    await job.save();

    res.json({
      message: 'Work submitted. Buyer has 48 hours to review.',
      job,
    });
  } catch (err) {
    next(err);
  }
});

// Buyer approves submitted work and releases payment
router.post('/:id/review/approve', authMiddleware, async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const participant = await resolveParticipantContext(job, req.userId);
    if (!participant.isBuyer) {
      return res.status(403).json({ error: 'Only buyer can approve work' });
    }

    await applyReviewTimeoutIfNeeded(job);
    if (job.workflow_stage === 'completed') {
      return res.status(400).json({ error: 'Job already completed' });
    }

    if (job.workflow_stage !== 'review') {
      return res.status(400).json({ error: 'Approve action is only available during review' });
    }

    await finalizeJobPayment(job, 'Buyer approved deliverable. Payment released instantly.');

    res.json({
      message: 'Approved. Payment released to seller.',
      job,
    });
  } catch (err) {
    next(err);
  }
});

// Buyer requests one revision round
router.post('/:id/review/request-revision', authMiddleware, [
  body('reason').optional().isLength({ max: 1500 }),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const participant = await resolveParticipantContext(job, req.userId);
    if (!participant.isBuyer) {
      return res.status(403).json({ error: 'Only buyer can request revision' });
    }

    await applyReviewTimeoutIfNeeded(job);
    if (job.workflow_stage !== 'review') {
      return res.status(400).json({ error: 'Revision requests are only available during review' });
    }

    if (job.revision_rounds_used >= 1) {
      return res.status(400).json({ error: 'Revision limit reached (one round only)' });
    }

    const reason = req.body.reason?.trim();
    if (reason) {
      job.progress_updates.push({ message: `Revision requested: ${reason}`, createdAt: new Date() });
    }

    job.revision_rounds_used += 1;
    job.workflow_stage = 'in_progress';
    job.review_deadline = null;
    job.updatedAt = new Date();
    await job.save();

    res.json({
      message: 'Revision requested. Seller can resubmit once.',
      job,
    });
  } catch (err) {
    next(err);
  }
});

// Buyer can raise dispute while in review
router.post('/:id/dispute', authMiddleware, [
  body('reason').optional().isLength({ max: 2000 }),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const participant = await resolveParticipantContext(job, req.userId);
    if (!participant.isBuyer) {
      return res.status(403).json({ error: 'Only buyer can raise a dispute' });
    }

    await applyReviewTimeoutIfNeeded(job);
    if (job.workflow_stage !== 'review') {
      return res.status(400).json({ error: 'Disputes can only be raised during review' });
    }

    job.dispute_raised = true;
    job.dispute_reason = req.body.reason?.trim() || 'No reason provided';
    job.dispute_raised_by = req.userId;
    job.dispute_raised_at = new Date();
    job.workflow_stage = 'dispute';
    job.updatedAt = new Date();
    await job.save();

    res.json({
      message: 'Dispute raised. Awaiting manual review.',
      job,
    });
  } catch (err) {
    next(err);
  }
});

// Manual timeout check endpoint for participant dashboards
router.post('/:id/workflow/check-timeout', authMiddleware, async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const participant = await resolveParticipantContext(job, req.userId);
    if (!participant.isBuyer && !participant.isSeller) {
      return res.status(403).json({ error: 'Only buyer or winning seller can trigger timeout checks' });
    }

    const { autoReleased } = await applyReviewTimeoutIfNeeded(job);
    res.json({
      autoReleased,
      job,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
