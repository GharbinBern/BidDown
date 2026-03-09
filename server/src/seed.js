import dotenv from 'dotenv';
import mongoose from 'mongoose';

import User from './models/User.js';
import Job from './models/Job.js';
import Bid from './models/Bid.js';
import Review from './models/Review.js';

dotenv.config();

const PASSWORD = 'password123';
const BUYER_COUNT = 8;
const SELLER_COUNT = 8;
const JOB_COUNT = 50;

const CATEGORIES = ['Design', 'Development', 'Marketing', 'Writing', 'Legal', 'Consulting', 'Other'];

const BUYER_NAMES = [
  'Bella Buyer',
  'Aiden Brooks',
  'Nora Fields',
  'Caleb Reed',
  'Mia Carter',
  'Lucas Gray',
  'Chloe Hayes',
  'Ethan Cole',
];

const SELLER_NAMES = [
  'Sam Seller',
  'Devon Clark',
  'Maya Stone',
  'Noah Scott',
  'Ava Quinn',
  'Leo Price',
  'Ivy Lane',
  'Owen Hart',
];

const TITLE_PREFIXES = [
  'Landing Page',
  'Mobile App',
  'SEO Strategy',
  'Brand Kit',
  'Dashboard Build',
  'Content Plan',
  'Legal Drafting',
  'GTM Consulting',
  'Web Redesign',
  'Campaign Setup',
];

const TITLE_SUFFIXES = [
  'for Fintech Startup',
  'for E-commerce Platform',
  'for Healthcare Product',
  'for SaaS Launch',
  'for Creator Marketplace',
  'for Logistics Tool',
  'for Analytics Team',
  'for Education App',
  'for Travel Product',
  'for AI Workflow',
];

const SELLER_BIOS = [
  'UI/UX specialist focused on conversion-friendly interfaces.',
  'Full-stack engineer experienced in React and Node.',
  'Growth marketer with SEO and paid media background.',
  'Legal content writer for digital products and compliance.',
  'Brand and visual identity designer for startups.',
  'Product consultant for launches and pricing strategy.',
  'Content strategist for technical and B2B audiences.',
  'Automation builder for internal tools and operations.',
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFrom(list) {
  return list[randomInt(0, list.length - 1)];
}

function shuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickUnique(list, count) {
  const copy = [...list];
  const picked = [];

  while (copy.length && picked.length < count) {
    const idx = randomInt(0, copy.length - 1);
    picked.push(copy[idx]);
    copy.splice(idx, 1);
  }

  return picked;
}

function makeJobTitleCombinations() {
  const combos = [];
  for (const prefix of TITLE_PREFIXES) {
    for (const suffix of TITLE_SUFFIXES) {
      combos.push(`${prefix} ${suffix}`);
    }
  }
  return shuffle(combos);
}

function makeJobDescription(title, category) {
  const lowerTitle = title.toLowerCase();
  return `Need help with ${lowerTitle}. Please include a clear scope, timeline milestones, and final handoff notes tailored to this ${category.toLowerCase()} request.`;
}

async function createUsers() {
  const buyers = [];
  const sellers = [];

  for (let i = 0; i < BUYER_COUNT; i += 1) {
    const buyer = new User({
      email: `buyer${i + 1}@example.com`,
      password: PASSWORD,
      name: BUYER_NAMES[i],
      roles: ['buyer'],
      verified: true,
    });

    await buyer.save();
    buyers.push(buyer);
  }

  for (let i = 0; i < SELLER_COUNT; i += 1) {
    const seller = new User({
      email: `seller${i + 1}@example.com`,
      password: PASSWORD,
      name: SELLER_NAMES[i],
      roles: ['seller'],
      verified: true,
      seller_profile: {
        bio: SELLER_BIOS[i],
        hourly_rate: randomInt(35, 120),
        portfolio_url: `https://portfolio.example/seller${i + 1}`,
      },
    });

    await seller.save();
    sellers.push(seller);
  }

  return { buyers, sellers };
}

function createJobDocs(buyers) {
  const now = Date.now();
  const jobs = [];
  const titlePool = makeJobTitleCombinations();

  for (let i = 0; i < JOB_COUNT; i += 1) {
    const owner = randomFrom(buyers);
    const category = randomFrom(CATEGORIES);
    const title = titlePool[i % titlePool.length];
    const budget = randomInt(300, 6000);
    const hoursUntilDeadline = randomInt(24, 240);
    const deadline = new Date(now + hoursUntilDeadline * 60 * 60 * 1000);

    jobs.push({
      title,
      description: makeJobDescription(title, category),
      category,
      budget,
      owner_id: owner._id,
      deadline,
      sealed_until: deadline,
      status: 'open',
      bids_count: 0,
      escrow_released: false,
      rating_given: false,
      createdAt: new Date(now - randomInt(1, 14) * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    });
  }

  return jobs;
}

async function createBidsAndFinalizeJobs(jobs, sellers) {
  const bidsToInsert = [];
  const reviewsToInsert = [];
  const jobBulkOps = [];
  const bidBulkOps = [];

  for (const job of jobs) {
    const sellerCountForJob = randomInt(2, Math.min(8, sellers.length));
    const chosenSellers = pickUnique(sellers, sellerCountForJob);
    const jobBids = [];

    for (const seller of chosenSellers) {
      const maxAllowed = Math.max(80, Number(job.budget) - randomInt(20, 200));
      const amount = randomInt(50, maxAllowed);

      const bidDoc = {
        job_id: job._id,
        seller_id: seller._id,
        amount,
        note: `Bid proposal at $${amount} with milestone delivery plan.`,
        sealed: true,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      bidsToInsert.push(bidDoc);
      jobBids.push(bidDoc);
    }

    jobBulkOps.push({
      updateOne: {
        filter: { _id: job._id },
        update: { $set: { bids_count: jobBids.length } },
      },
    });
  }

  const insertedBids = await Bid.insertMany(bidsToInsert);
  const bidsByJob = new Map();

  insertedBids.forEach((bid) => {
    const key = String(bid.job_id);
    if (!bidsByJob.has(key)) bidsByJob.set(key, []);
    bidsByJob.get(key).push(bid);
  });

  for (const job of jobs) {
    const key = String(job._id);
    const jobBids = bidsByJob.get(key) || [];

    if (jobBids.length === 0) continue;

    const shouldClose = Math.random() < 0.7;
    if (!shouldClose) continue;

    const winningBid = [...jobBids].sort((a, b) => a.amount - b.amount)[0];
    const completed = Math.random() < 0.35;

    const newStatus = completed ? 'completed' : 'closed';
    const updatePayload = {
      status: newStatus,
      winning_bid_id: winningBid._id,
      escrow_amount: winningBid.amount,
      sealed_until: new Date(),
      updatedAt: new Date(),
    };

    if (completed) {
      updatePayload.completion_date = new Date();
      updatePayload.escrow_released = true;
    }

    jobBulkOps.push({
      updateOne: {
        filter: { _id: job._id },
        update: { $set: updatePayload },
      },
    });

    for (const bid of jobBids) {
      if (String(bid._id) === String(winningBid._id)) {
        bidBulkOps.push({
          updateOne: {
            filter: { _id: bid._id },
            update: {
              $set: {
                status: 'accepted',
                sealed: false,
                accepted_date: new Date(),
                updatedAt: new Date(),
              },
            },
          },
        });
      } else {
        bidBulkOps.push({
          updateOne: {
            filter: { _id: bid._id },
            update: {
              $set: {
                status: 'rejected',
                sealed: false,
                updatedAt: new Date(),
              },
            },
          },
        });
      }
    }

    const buyerToSellerRating = 5;
    const sellerToBuyerRating = 5;

    reviewsToInsert.push({
      job_id: job._id,
      buyer_id: job.owner_id,
      seller_id: winningBid.seller_id,
      reviewer_id: job.owner_id,
      reviewee_id: winningBid.seller_id,
      rating: buyerToSellerRating,
      quality_rating: 5,
      communication_rating: 5,
      timeliness_rating: 5,
      createdAt: new Date(),
    });

    reviewsToInsert.push({
      job_id: job._id,
      buyer_id: job.owner_id,
      seller_id: winningBid.seller_id,
      reviewer_id: winningBid.seller_id,
      reviewee_id: job.owner_id,
      rating: sellerToBuyerRating,
      quality_rating: 5,
      communication_rating: 5,
      timeliness_rating: 5,
      createdAt: new Date(),
    });
  }

  if (jobBulkOps.length) await Job.bulkWrite(jobBulkOps);
  if (bidBulkOps.length) await Bid.bulkWrite(bidBulkOps);
  if (reviewsToInsert.length) await Review.insertMany(reviewsToInsert);
}

async function updateUserRatingsAndStats() {
  const users = await User.find({}, { _id: 1 });

  for (const user of users) {
    const receivedReviews = await Review.find({ reviewee_id: user._id }, { rating: 1 });

    const reviewsCount = receivedReviews.length;
    const averageRating = reviewsCount
      ? Number((receivedReviews.reduce((sum, review) => sum + review.rating, 0) / reviewsCount).toFixed(2))
      : 5;

    const completedJobs = await Job.countDocuments({
      winning_bid_id: { $ne: null },
      status: { $in: ['closed', 'completed'] },
      _id: {
        $in: (await Bid.find({ seller_id: user._id, status: 'accepted' }, { job_id: 1 })).map((bid) => bid.job_id),
      },
    });

    await User.findByIdAndUpdate(user._id, {
      average_rating: averageRating,
      reviews_count: reviewsCount,
      total_jobs_completed: completedJobs,
      updatedAt: new Date(),
    });
  }
}

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Missing MONGODB_URI in server/.env');
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB for seeding');

  await Review.deleteMany({});
  await Bid.deleteMany({});
  await Job.deleteMany({});
  await User.deleteMany({});
  console.log('Cleared existing data');

  const { buyers, sellers } = await createUsers();

  const jobDocs = createJobDocs(buyers);
  const jobs = await Job.insertMany(jobDocs);

  await createBidsAndFinalizeJobs(jobs, sellers);
  await updateUserRatingsAndStats();

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
