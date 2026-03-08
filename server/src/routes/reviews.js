import express from 'express';
import { body, validationResult } from 'express-validator';
import Review from '../models/Review.js';
import Job from '../models/Job.js';
import Bid from '../models/Bid.js';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Leave a review (auth required)
router.post('/', authMiddleware, [
  body('job_id').notEmpty(),
  body('seller_id').notEmpty(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().isLength({ max: 2000 }),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { job_id, seller_id, rating, comment, quality_rating, communication_rating, timeliness_rating } = req.body;

    // Check job exists and is completed
    const job = await Job.findById(job_id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.status !== 'completed' && job.status !== 'closed') {
      return res.status(400).json({ error: 'Cannot review incomplete job' });
    }

    // Check user is the buyer
    if (job.owner_id.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only job owner can review' });
    }

    // Check review doesn't already exist
    const existingReview = await Review.findOne({ job_id });
    if (existingReview) {
      return res.status(400).json({ error: 'Review already exists for this job' });
    }

    // Create review
    const review = new Review({
      job_id,
      buyer_id: req.userId,
      seller_id,
      rating,
      comment,
      quality_rating,
      communication_rating,
      timeliness_rating,
    });

    await review.save();

    // Update seller stats
    const allReviews = await Review.find({ seller_id });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await User.findByIdAndUpdate(seller_id, {
      average_rating: avgRating,
      reviews_count: allReviews.length,
    });

    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
});

// Get seller reviews
router.get('/seller/:sellerId', async (req, res, next) => {
  try {
    const reviews = await Review.find({ seller_id: req.params.sellerId })
      .populate('buyer_id', 'name avatar')
      .sort({ createdAt: -1 });

    const stats = {
      count: reviews.length,
      average_rating: reviews.length > 0 
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2)
        : 0,
      reviews,
    };

    res.json(stats);
  } catch (err) {
    next(err);
  }
});

// Get reviews for a job (auth required)
router.get('/job/:jobId', authMiddleware, async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Only owner or seller can view
    const bid = await Bid.findById(job.winning_bid_id);
    if (job.owner_id.toString() !== req.userId && (!bid || bid.seller_id.toString() !== req.userId)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const review = await Review.findOne({ job_id: req.params.jobId })
      .populate('buyer_id', 'name avatar');

    res.json(review);
  } catch (err) {
    next(err);
  }
});

export default router;
