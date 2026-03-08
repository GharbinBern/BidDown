import dotenv from 'dotenv';
import mongoose from 'mongoose';

import User from './models/User.js';
import Job from './models/Job.js';
import Bid from './models/Bid.js';
import Review from './models/Review.js';

dotenv.config();

async function findOrCreateUser({ email, password, name, roles, seller_profile }) {
  let user = await User.findOne({ email });
  if (user) return user;

  user = new User({
    email,
    password,
    name,
    roles,
    seller_profile,
    verified: true,
  });

  await user.save();
  return user;
}

async function findOrCreateJob({ title, description, category, budget, owner_id, hoursUntilDeadline }) {
  let job = await Job.findOne({ title, owner_id });
  if (job) return job;

  const deadline = new Date(Date.now() + hoursUntilDeadline * 60 * 60 * 1000);

  job = new Job({
    title,
    description,
    category,
    budget,
    owner_id,
    deadline,
    sealed_until: deadline,
    status: 'open',
  });

  await job.save();
  return job;
}

async function findOrCreateBid({ job_id, seller_id, amount, note }) {
  let bid = await Bid.findOne({ job_id, seller_id });
  if (bid) return bid;

  bid = new Bid({
    job_id,
    seller_id,
    amount,
    note,
    sealed: true,
    status: 'pending',
  });

  await bid.save();
  await Job.findByIdAndUpdate(job_id, { $inc: { bids_count: 1 } });
  return bid;
}

async function findOrCreateReview({ job_id, buyer_id, seller_id, rating, comment, quality_rating, communication_rating, timeliness_rating }) {
  let review = await Review.findOne({ job_id, buyer_id, seller_id });
  if (review) return review;

  review = new Review({
    job_id,
    buyer_id,
    seller_id,
    rating,
    comment,
    quality_rating,
    communication_rating,
    timeliness_rating,
  });

  await review.save();

  const sellerReviews = await Review.find({ seller_id });
  const avgRating = sellerReviews.reduce((sum, r) => sum + r.rating, 0) / sellerReviews.length;
  await User.findByIdAndUpdate(seller_id, {
    average_rating: Number(avgRating.toFixed(2)),
    reviews_count: sellerReviews.length,
  });

  return review;
}

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Missing MONGODB_URI in server/.env');
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB for seeding');

  const buyer = await findOrCreateUser({
    email: 'buyer@example.com',
    password: 'password123',
    name: 'Bella Buyer',
    roles: ['buyer'],
  });

  const sellerA = await findOrCreateUser({
    email: 'sellera@example.com',
    password: 'password123',
    name: 'Sam Seller',
    roles: ['seller'],
    seller_profile: {
      bio: 'UI/UX and branding specialist',
      hourly_rate: 45,
      portfolio_url: 'https://portfolio.example/sam',
    },
  });

  const sellerB = await findOrCreateUser({
    email: 'sellerb@example.com',
    password: 'password123',
    name: 'Devon Seller',
    roles: ['seller'],
    seller_profile: {
      bio: 'React and Node full-stack developer',
      hourly_rate: 60,
      portfolio_url: 'https://portfolio.example/devon',
    },
  });

  const dualRoleUser = await findOrCreateUser({
    email: 'dual@example.com',
    password: 'password123',
    name: 'Riley Hybrid',
    roles: ['buyer', 'seller'],
    seller_profile: {
      bio: 'Growth and product consultant',
      hourly_rate: 70,
      portfolio_url: 'https://portfolio.example/riley',
    },
  });

  const sellerC = await findOrCreateUser({
    email: 'sellerc@example.com',
    password: 'password123',
    name: 'Maya Seller',
    roles: ['seller'],
    seller_profile: {
      bio: 'SEO and growth strategist',
      hourly_rate: 55,
      portfolio_url: 'https://portfolio.example/maya',
    },
  });

  const sellerD = await findOrCreateUser({
    email: 'sellerd@example.com',
    password: 'password123',
    name: 'Noah Seller',
    roles: ['seller'],
    seller_profile: {
      bio: 'Legal and compliance writer',
      hourly_rate: 65,
      portfolio_url: 'https://portfolio.example/noah',
    },
  });

  const sellerE = await findOrCreateUser({
    email: 'sellere@example.com',
    password: 'password123',
    name: 'Ava Seller',
    roles: ['seller'],
    seller_profile: {
      bio: 'Scriptwriting and product storytelling',
      hourly_rate: 50,
      portfolio_url: 'https://portfolio.example/ava',
    },
  });

  const jobA = await findOrCreateJob({
    title: 'Landing page redesign for fintech startup',
    description: 'Need a responsive redesign with clean UI and updated copy blocks.',
    category: 'Design',
    budget: 900,
    owner_id: buyer._id,
    hoursUntilDeadline: 72,
  });

  const jobB = await findOrCreateJob({
    title: 'Build analytics dashboard in React',
    description: 'Dashboard with charts, filters, and API integration for KPIs.',
    category: 'Development',
    budget: 2400,
    owner_id: dualRoleUser._id,
    hoursUntilDeadline: 96,
  });

  const jobC = await findOrCreateJob({
    title: 'Logo & Brand Identity Design',
    description: 'Need a complete brand identity package: logo, color palette, typography guide, and basic brand guidelines doc. Modern, clean aesthetic for a fintech startup.',
    category: 'Design',
    budget: 800,
    owner_id: buyer._id,
    hoursUntilDeadline: 48,
  });

  const jobD = await findOrCreateJob({
    title: 'React Dashboard Development',
    description: 'Build a data analytics dashboard using React with chart visualizations, responsive layout, and API integration.',
    category: 'Development',
    budget: 2200,
    owner_id: dualRoleUser._id,
    hoursUntilDeadline: 12,
  });

  const jobE = await findOrCreateJob({
    title: 'SEO Content Strategy (3 months)',
    description: 'Develop a full SEO content strategy including keyword research, competitor analysis, and monthly content calendar.',
    category: 'Marketing',
    budget: 1500,
    owner_id: buyer._id,
    hoursUntilDeadline: 84,
  });

  const jobF = await findOrCreateJob({
    title: 'Terms of Service + Privacy Policy',
    description: 'Need ToS and Privacy Policy drafted for a SaaS product operating in the US and EU with GDPR considerations.',
    category: 'Legal',
    budget: 600,
    owner_id: buyer._id,
    hoursUntilDeadline: 120,
  });

  const jobG = await findOrCreateJob({
    title: 'Product Explainer Video Script',
    description: '90-second explainer video script for a B2B SaaS tool with strong hook, value proposition, and CTA.',
    category: 'Writing',
    budget: 350,
    owner_id: dualRoleUser._id,
    hoursUntilDeadline: 60,
  });

  const jobH = await findOrCreateJob({
    title: 'Go-to-Market Strategy Consulting',
    description: '4-week engagement to develop GTM strategy for a new mobile app: ICP, pricing model, and launch plan.',
    category: 'Consulting',
    budget: 4000,
    owner_id: buyer._id,
    hoursUntilDeadline: 144,
  });

  const bidA1 = await findOrCreateBid({
    job_id: jobA._id,
    seller_id: sellerA._id,
    amount: 760,
    note: 'Includes two revision rounds and style guide updates.',
  });

  await findOrCreateBid({
    job_id: jobA._id,
    seller_id: sellerB._id,
    amount: 820,
    note: 'Delivery in 5 days with component-based design system.',
  });

  await findOrCreateBid({
    job_id: jobB._id,
    seller_id: sellerA._id,
    amount: 2100,
    note: 'Includes charts, auth guards, and deployment support.',
  });

  await findOrCreateBid({
    job_id: jobC._id,
    seller_id: sellerA._id,
    amount: 620,
    note: '5 concepts, 3 revisions, and brand kit source files.',
  });
  await findOrCreateBid({
    job_id: jobC._id,
    seller_id: sellerB._id,
    amount: 680,
    note: 'Full brand package with design tokens and logo variants.',
  });
  await findOrCreateBid({
    job_id: jobC._id,
    seller_id: sellerC._id,
    amount: 590,
    note: '2 concepts plus unlimited revisions during project window.',
  });

  await findOrCreateBid({
    job_id: jobD._id,
    seller_id: sellerA._id,
    amount: 1800,
    note: 'Delivery in 5 days, React + TypeScript + test coverage.',
  });
  await findOrCreateBid({
    job_id: jobD._id,
    seller_id: sellerB._id,
    amount: 1950,
    note: 'Includes production hardening and deployment checklist.',
  });
  await findOrCreateBid({
    job_id: jobD._id,
    seller_id: sellerC._id,
    amount: 1700,
    note: 'Can start immediately with daily progress updates.',
  });

  await findOrCreateBid({
    job_id: jobE._id,
    seller_id: sellerC._id,
    amount: 1200,
    note: 'Includes monthly reporting and content performance dashboard.',
  });
  await findOrCreateBid({
    job_id: jobE._id,
    seller_id: dualRoleUser._id,
    amount: 1350,
    note: '3-month strategy with keyword clustering and roadmap.',
  });

  await findOrCreateBid({
    job_id: jobF._id,
    seller_id: sellerD._id,
    amount: 480,
    note: 'US-focused SaaS terms with GDPR addendum.',
  });
  await findOrCreateBid({
    job_id: jobF._id,
    seller_id: sellerE._id,
    amount: 550,
    note: 'Legal templates customized to your product workflow.',
  });

  await findOrCreateBid({
    job_id: jobG._id,
    seller_id: sellerE._id,
    amount: 280,
    note: 'Three script options with CTA variants and revisions.',
  });
  await findOrCreateBid({
    job_id: jobG._id,
    seller_id: sellerC._id,
    amount: 295,
    note: 'SaaS-oriented messaging optimized for product demos.',
  });
  await findOrCreateBid({
    job_id: jobG._id,
    seller_id: sellerB._id,
    amount: 260,
    note: 'Delivered in 48 hours with voice-over direction notes.',
  });

  await findOrCreateBid({
    job_id: jobH._id,
    seller_id: dualRoleUser._id,
    amount: 3400,
    note: 'Full GTM playbook with experimentation roadmap.',
  });
  await findOrCreateBid({
    job_id: jobH._id,
    seller_id: sellerA._id,
    amount: 3600,
    note: 'Launch plan plus pricing sensitivity and channel strategy.',
  });

  await findOrCreateReview({
    job_id: jobA._id,
    buyer_id: buyer._id,
    seller_id: sellerA._id,
    rating: 5,
    comment: 'Great communication and delivered ahead of schedule.',
    quality_rating: 5,
    communication_rating: 5,
    timeliness_rating: 5,
  });

  await Job.findByIdAndUpdate(jobA._id, {
    status: 'closed',
    winning_bid_id: bidA1._id,
    escrow_amount: bidA1.amount,
    escrow_released: false,
  });

  await Bid.findByIdAndUpdate(bidA1._id, {
    status: 'accepted',
    sealed: false,
    accepted_date: new Date(),
  });

  await Bid.updateMany(
    { job_id: jobA._id, _id: { $ne: bidA1._id } },
    { status: 'rejected', sealed: false }
  );

  console.log('Seed complete.');
  console.log('Users:', await User.countDocuments());
  console.log('Jobs:', await Job.countDocuments());
  console.log('Bids:', await Bid.countDocuments());
  console.log('Reviews:', await Review.countDocuments());

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

seed().catch(async (err) => {
  console.error('Seeding failed:', err.message);
  await mongoose.disconnect();
  process.exit(1);
});
