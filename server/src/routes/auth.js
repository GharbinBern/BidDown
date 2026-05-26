import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Bid from '../models/Bid.js';
import Job from '../models/Job.js';
import Review from '../models/Review.js';
import ProviderProfile from '../models/Provider.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

const DEMO_EMAILS = ['demo.buyer@brafom.gh', 'demo.seller@brafom.gh'];

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
    const normalizedEmail = String(email || '').trim().toLowerCase();

    // Find user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[auth:login] user not found', { email: normalizedEmail });
      }
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[auth:login] password mismatch', { email: normalizedEmail, userId: String(user._id) });
      }
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, roles: user.roles },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    if (process.env.NODE_ENV !== 'production') {
      console.info('[auth:login] login success', { email: normalizedEmail, userId: String(user._id) });
    }

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

// Update current user profile
router.put('/me/profile', authMiddleware, [
  body('firstName').optional().isString().trim().isLength({ min: 1, max: 60 }),
  body('lastName').optional().isString().trim().isLength({ min: 1, max: 80 }),
  body('name').optional().isString().trim().isLength({ min: 1, max: 140 }),
  body('email').optional().isEmail(),
  body('phone').optional().isString().trim().isLength({ max: 40 }),
  body('city').optional().isString().trim().isLength({ max: 80 }),
  body('neighbourhood').optional().isString().trim().isLength({ max: 80 }),
  body('about').optional().isString().trim().isLength({ max: 1200 }),
  body('primaryCategory').optional().isString().trim().isLength({ max: 80 }),
  body('skills').optional().isArray({ max: 40 }),
  body('skills.*').optional().isString().trim().isLength({ min: 1, max: 80 }),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (DEMO_EMAILS.includes(user.email) && req.body.email && req.body.email !== user.email) {
      return res.status(403).json({ error: 'Demo account email cannot be changed.' });
    }

    const {
      firstName,
      lastName,
      name,
      email,
      phone,
      city,
      neighbourhood,
      about,
      primaryCategory,
      skills,
    } = req.body;

    const nextNameParts = [
      typeof firstName === 'string' ? firstName.trim() : '',
      typeof lastName === 'string' ? lastName.trim() : '',
    ].filter(Boolean);
    const nextName = nextNameParts.length > 0
      ? nextNameParts.join(' ')
      : (typeof name === 'string' ? name.trim() : '');

    if (email && email !== user.email) {
      const existing = await User.findOne({ email, _id: { $ne: user._id } });
      if (existing) {
        return res.status(400).json({ error: 'Email already in use' });
      }
      user.email = email;
    }

    if (nextName) user.name = nextName;
    if (typeof phone === 'string') user.phone = phone.trim();
    if (typeof city === 'string' && city.trim()) user.city = city.trim();
    if (typeof neighbourhood === 'string') user.neighbourhood = neighbourhood.trim();
    if (typeof primaryCategory === 'string' && primaryCategory.trim()) user.primaryCategory = primaryCategory.trim();

    if (typeof about === 'string') {
      const sellerProfile = user.seller_profile || {};
      user.seller_profile = {
        ...sellerProfile,
        bio: about.trim(),
      };
    }

    user.updatedAt = new Date();
    await user.save();

    const providerProfile = await ProviderProfile.findOneAndUpdate(
      { user_id: user._id },
      {
        $set: {
          city: typeof city === 'string' && city.trim() ? city.trim() : (user.city || 'Accra'),
          skills: Array.isArray(skills) ? skills.filter(Boolean) : [],
          headline: primaryCategory
            ? `${primaryCategory} specialist`
            : undefined,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          user_id: user._id,
          country: 'Ghana',
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({
      user: user.getPublicProfile(),
      provider_profile: providerProfile,
    });
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
