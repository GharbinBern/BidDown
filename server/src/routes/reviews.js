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
  body('reviewee_id').optional().notEmpty(),
  body('seller_id').optional().notEmpty(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().isLength({ max: 2000 }),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { job_id, reviewee_id, seller_id, rating, comment, quality_rating, communication_rating, timeliness_rating } = req.body;
    const targetRevieweeId = reviewee_id || seller_id;

    // Check job exists and is completed
    const job = await Job.findById(job_id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.status !== 'completed' && job.status !== 'closed') {
      return res.status(400).json({ error: 'Cannot review incomplete job' });
    }

    const winningBid = await Bid.findById(job.winning_bid_id);
    if (!winningBid) {
      return res.status(400).json({ error: 'Cannot review before a winning bid exists' });
    }

    const buyerId = job.owner_id.toString();
    const sellerId = winningBid.seller_id.toString();
    const reviewerId = req.userId;

    if (reviewerId !== buyerId && reviewerId !== sellerId) {
      return res.status(403).json({ error: 'Only job participants can review' });
    }

    if (!targetRevieweeId) {
      return res.status(400).json({ error: 'reviewee_id is required' });
    }

    const targetId = targetRevieweeId.toString();
    const expectedRevieweeId = reviewerId === buyerId ? sellerId : buyerId;
    if (targetId !== expectedRevieweeId) {
      return res.status(400).json({ error: 'You can only review the other participant in this job' });
    }

    // Check review doesn't already exist
    const existingReview = await Review.findOne({ job_id, reviewer_id: reviewerId });
    if (existingReview) {
      return res.status(400).json({ error: 'You already reviewed this job' });
    }

    // Create review
    const review = new Review({
      job_id,
      buyer_id: buyerId,
      seller_id: sellerId,
      reviewer_id: reviewerId,
      reviewee_id: targetId,
      rating,
      comment,
      quality_rating,
      communication_rating,
      timeliness_rating,
    });

    await review.save();

    // Update stats for reviewed user
    const allReviews = await Review.find({
      $or: [
        { reviewee_id: targetId },
        // Legacy fallback (before reviewee_id existed)
        { reviewee_id: { $exists: false }, seller_id: targetId },
      ],
    });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await User.findByIdAndUpdate(targetId, {
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
    const reviews = await Review.find({
      $or: [
        { reviewee_id: req.params.sellerId },
        { reviewee_id: { $exists: false }, seller_id: req.params.sellerId },
      ],
    })
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

    const bid = await Bid.findById(job.winning_bid_id);
    if (!bid) {
      return res.status(404).json({ error: 'Winning bid not found' });
    }

    // Only owner or winning seller can view
    if (job.owner_id.toString() !== req.userId && bid.seller_id.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const reviews = await Review.find({ job_id: req.params.jobId })
      .populate('buyer_id', 'name avatar')
      .populate('reviewer_id', 'name avatar')
      .populate('reviewee_id', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    next(err);
  }
});

export default router;
