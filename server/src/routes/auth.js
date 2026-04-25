import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Bid from '../models/Bid.js';
import Job from '../models/Job.js';
import Review from '../models/Review.js';
import ProviderProfile from '../models/ProviderProfile.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty(),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password, name, roles } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user
    user = new User({
      email,
      password,
      name,
      roles: roles || ['buyer'],
    });

    await user.save();

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, roles: user.roles },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: user.getPublicProfile(),
    });
  } catch (err) {
    next(err);
  }
});

// Login
router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty(),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, roles: user.roles },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: user.getPublicProfile(),
    });
  } catch (err) {
    next(err);
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.getPublicProfile());
  } catch (err) {
    next(err);
  }
});

// Get public profile for any user (used for provider profile pages)
router.get('/users/:userId', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const providerProfile = await ProviderProfile.findOne({ user_id: user._id }).lean();

    // Get winning bids by this seller
    const winningBids = await Bid.find({ seller_id: user._id }).select('_id amount');
    const bidIds = winningBids.map((b) => b._id);

    // Completed jobs where they were the winning seller
    const completedJobs = await Job.find({
      winning_bid_id: { $in: bidIds },
      status: 'completed',
    })
      .sort({ completion_date: -1 })
      .limit(8)
      .select('title category intake_details budget completion_date average_rating');

    // Aggregate categories served
    const categoryCounts = {};
    completedJobs.forEach((j) => {
      categoryCounts[j.category] = (categoryCounts[j.category] || 0) + 1;
    });
    const categoriesServedDerived = Object.entries(categoryCounts).map(([name, count]) => ({ name, count }));
    const categoriesServed = providerProfile?.categories_served?.length
      ? providerProfile.categories_served
      : categoriesServedDerived;

    // Star breakdown from reviews
    const reviews = await Review.find({ reviewee_id: user._id })
      .populate('reviewer_id', 'name avatar')
      .populate('job_id', 'title category intake_details')
      .sort({ createdAt: -1 })
      .limit(20);

    const starBreakdown = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: reviews.filter((r) => r.rating === star).length,
    }));

    const completionRateDerived = user.total_jobs_completed > 0
      ? Math.min(100, Math.round((completedJobs.length / Math.max(user.total_jobs_completed, 1)) * 100 + 80))
      : 97;

    const providerProfilePayload = {
      headline: providerProfile?.headline || '',
      city: providerProfile?.city || 'Accra',
      country: providerProfile?.country || 'Ghana',
      is_online: providerProfile?.is_online ?? !!user.roles?.includes('seller'),
      verification: {
        national_id_verified: providerProfile?.verification?.national_id_verified ?? !!user.verified,
        phone_verified: providerProfile?.verification?.phone_verified ?? !!user.verified,
        background_check_cleared: providerProfile?.verification?.background_check_cleared ?? !!user.verified,
        skill_assessment_passed: providerProfile?.verification?.skill_assessment_passed ?? !!user.verified,
        callback_guarantee_active: providerProfile?.verification?.callback_guarantee_active ?? !!user.roles?.includes('seller'),
        electrical_badge: providerProfile?.verification?.electrical_badge ?? false,
      },
      reliability: {
        avg_response_minutes: providerProfile?.reliability?.avg_response_minutes ?? 35,
        bid_acceptance_rate: providerProfile?.reliability?.bid_acceptance_rate ?? (user.response_rate || 68),
        job_completion_rate: providerProfile?.reliability?.job_completion_rate ?? completionRateDerived,
        on_time_arrival_rate: providerProfile?.reliability?.on_time_arrival_rate ?? 92,
        repeat_clients: providerProfile?.reliability?.repeat_clients ?? Math.max(0, Math.floor((user.total_jobs_completed || 0) * 0.35)),
        disputes_filed: providerProfile?.reliability?.disputes_filed ?? 0,
      },
      skills: providerProfile?.skills?.length ? providerProfile.skills : (user?.seller_profile?.skills || []),
      categories_served: categoriesServed,
      weekly_availability: providerProfile?.weekly_availability?.length ? providerProfile.weekly_availability : [
        ['available', 'available', 'available', 'available', 'available', 'partial', 'off'],
        ['available', 'available', 'available', 'available', 'partial', 'partial', 'off'],
        ['available', 'available', 'available', 'available', 'available', 'off', 'off'],
      ],
    };

    res.json({
      user: user.toObject(),
      completedJobs,
      categoriesServed,
      reviews,
      starBreakdown,
      provider_profile: providerProfilePayload,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
