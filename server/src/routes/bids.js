import express from 'express';
import { body, validationResult } from 'express-validator';
import Bid from '../models/Bid.js';
import Job from '../models/Job.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Submit a bid (auth required)
router.post('/', authMiddleware, [
  body('job_id').notEmpty(),
  body('amount').isNumeric({ min: 50 }),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { job_id, amount, note } = req.body;

    // Check job exists
    const job = await Job.findById(job_id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check job is open
    if (job.status !== 'open') {
      return res.status(400).json({ error: 'Job is closed' });
    }

    // Check amount is below budget
    if (amount > job.budget) {
      return res.status(400).json({ error: 'Bid exceeds budget' });
    }

    // Check user is not the job owner
    if (job.owner_id.toString() === req.userId) {
      return res.status(400).json({ error: 'Cannot bid on own job' });
    }

    // Check user hasn't already bid
    const existingBid = await Bid.findOne({ job_id, seller_id: req.userId });
    if (existingBid) {
      return res.status(400).json({ error: 'You already bid on this job' });
    }

    // Create bid
    const bid = new Bid({
      job_id,
      seller_id: req.userId,
      amount,
      note,
      sealed: true,
    });

    await bid.save();

    // Update job bid count
    await Job.findByIdAndUpdate(job_id, { $inc: { bids_count: 1 } });

    res.status(201).json(bid);
  } catch (err) {
    next(err);
  }
});

// Get user's bids
router.get('/my-bids', authMiddleware, async (req, res, next) => {
  try {
    const bids = await Bid.find({ seller_id: req.userId })
      .populate('job_id', 'title budget status deadline')
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (err) {
    next(err);
  }
});

// Get bids for a job (owner only)
router.get('/job/:jobId', authMiddleware, async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.owner_id.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const bids = await Bid.find({ job_id: req.params.jobId })
      .populate('seller_id', 'name avatar average_rating')
      .sort({ amount: 1 });

    res.json(bids);
  } catch (err) {
    next(err);
  }
});

// Withdraw bid (seller only, only if job still open)
router.post('/:id/withdraw', authMiddleware, async (req, res, next) => {
  try {
    const bid = await Bid.findById(req.params.id);

    if (!bid) {
      return res.status(404).json({ error: 'Bid not found' });
    }

    if (bid.seller_id.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const job = await Job.findById(bid.job_id);
    if (job.status !== 'open') {
      return res.status(400).json({ error: 'Cannot withdraw from closed job' });
    }

    bid.status = 'withdrawn';
    await bid.save();

    await Job.findByIdAndUpdate(bid.job_id, { $inc: { bids_count: -1 } });

    res.json({ message: 'Bid withdrawn' });
  } catch (err) {
    next(err);
  }
});

export default router;
