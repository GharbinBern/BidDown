import express from 'express';
import { body, validationResult, query } from 'express-validator';
import Job from '../models/Job.js';
import Bid from '../models/Bid.js';
import User from '../models/User.js';
import { authMiddleware, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

const autoCloseExpiredOpenJobs = async () => {
  const now = new Date();
  await Job.updateMany(
    { status: 'open', deadline: { $lt: now } },
    { $set: { status: 'closed', updatedAt: now } }
  );
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
    job.status = 'closed';
    job.winning_bid_id = bid._id;
    job.escrow_amount = bid.amount;
    await job.save();

    bid.status = 'accepted';
    bid.accepted_date = new Date();
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

export default router;
