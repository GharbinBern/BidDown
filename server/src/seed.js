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

const CATEGORIES = ['Home Repairs', 'Tutoring', 'Photography', 'Cleaning', 'Delivery', 'Design & Print'];

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

const CATEGORY_TEMPLATES = {
  'Home Repairs': [
    {
      title: 'Fix leaking overhead tank and replace float valve',
      description: 'Overhead tank has been dripping for two weeks. Need diagnostics, valve replacement, and a leak test before handoff.',
      budgetRange: [250, 950],
    },
    {
      title: 'Repair cracked wall and repaint one bedroom',
      description: 'Need crack filling, sanding, and repainting with clean finish. Please include materials and labor in quote.',
      budgetRange: [400, 1400],
    },
    {
      title: 'Service split AC and fix weak cooling issue',
      description: 'Bedroom unit is not cooling properly. Requesting inspection, cleaning, and any minor repairs.',
      budgetRange: [300, 1100],
    },
  ],
  Tutoring: [
    {
      title: 'WASSCE elective mathematics tutoring - 4 sessions',
      description: 'Form 3 student needs focused prep on sequences, series, and vectors with weekly practice sets.',
      budgetRange: [300, 1200],
    },
    {
      title: 'Primary reading support for Grade 4 learner',
      description: 'Need patient tutor for comprehension and vocabulary improvement, twice a week for one month.',
      budgetRange: [250, 900],
    },
    {
      title: 'Python fundamentals coaching for beginner',
      description: 'Need practical beginner lessons on variables, loops, functions, and mini project guidance.',
      budgetRange: [400, 1500],
    },
  ],
  Photography: [
    {
      title: 'Outdoor graduation shoot with edited album',
      description: 'Two-hour outdoor shoot for graduation portraits, edited photos delivered within five days.',
      budgetRange: [500, 1800],
    },
    {
      title: 'Product photos for small online store launch',
      description: 'Need clean product images on white background for about 25 items and basic retouching.',
      budgetRange: [700, 2400],
    },
    {
      title: 'Corporate headshots for 12-person team',
      description: 'On-site headshots with basic lighting setup and color-corrected edits for company profiles.',
      budgetRange: [900, 3000],
    },
  ],
  Cleaning: [
    {
      title: 'Deep clean 3-bedroom apartment before move-in',
      description: 'Need full apartment cleaning including kitchen degreasing, bathrooms, windows, and floors.',
      budgetRange: [300, 1200],
    },
    {
      title: 'Weekly office cleaning for shared workspace',
      description: 'Three-room office needs recurring cleaning every weekend including washrooms and glass doors.',
      budgetRange: [500, 1800],
    },
    {
      title: 'Post-renovation cleanup for living area',
      description: 'Need dust and debris cleanup after minor renovation. Includes floor polish and disposal support.',
      budgetRange: [350, 1300],
    },
  ],
  Delivery: [
    {
      title: 'Move furniture from Tema to Adenta',
      description: 'Need pickup truck and two helpers to move bed frame, wardrobe, and fridge in one trip.',
      budgetRange: [500, 2000],
    },
    {
      title: 'Same-day parcel delivery for 15 customer orders',
      description: 'Need reliable rider support for same-day deliveries within Accra with proof-of-delivery updates.',
      budgetRange: [350, 1400],
    },
    {
      title: 'Event logistics pickup and return support',
      description: 'Need van delivery for event items in the morning and return pickup by evening.',
      budgetRange: [450, 1700],
    },
  ],
  'Design & Print': [
    {
      title: 'Logo and business card design for tailoring shop',
      description: 'Need modern logo concepts, final business card layout, and print-ready files in CMYK format.',
      budgetRange: [450, 1800],
    },
    {
      title: 'Flyer and roll-up banner for church conference',
      description: 'Need event flyer plus one roll-up banner design with ready-to-print outputs and source files.',
      budgetRange: [500, 1900],
    },
    {
      title: 'Menu redesign and print setup for cafe relaunch',
      description: 'Need refreshed menu design and print setup for table menus and wall poster versions.',
      budgetRange: [600, 2100],
    },
  ],
};

const SELLER_BIOS = [
  'Certified technician for plumbing and minor electrical repair jobs.',
  'Patient tutor focused on exam prep and confidence-building study routines.',
  'Event and portrait photographer with fast editing turnaround.',
  'Experienced residential and office cleaning service lead.',
  'Local delivery specialist for parcel, moving, and logistics support.',
  'Brand designer producing print-ready visual assets for SMEs.',
  'Skilled handyman for household maintenance and appliance servicing.',
  'Creative print designer for flyers, banners, and promo materials.',
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

function randomBudgetForCategory(category) {
  const templates = CATEGORY_TEMPLATES[category] || [];
  if (!templates.length) return randomInt(300, 2500);
  const selected = randomFrom(templates);
  return randomInt(selected.budgetRange[0], selected.budgetRange[1]);
}

function randomTemplateForCategory(category) {
  const templates = CATEGORY_TEMPLATES[category] || [];
  if (!templates.length) {
    return {
      title: `${category} service request`,
      description: `Need a verified provider for ${category.toLowerCase()} with clear timeline and deliverables.`,
      budgetRange: [300, 2500],
    };
  }
  return randomFrom(templates);
}

function sampleIntakeDetails(category) {
  switch (category) {
    case 'Home Repairs':
      return {
        location: randomFrom(['East Legon, Accra', 'Tema Community 7', 'Adenta, Accra']),
        issue_type: randomFrom(['Plumbing', 'Electrical', 'Carpentry']),
        access_window: randomFrom(['Weekdays 9am-5pm', 'Saturday morning', 'Any day after 2pm']),
      };
    case 'Tutoring':
      return {
        subject: randomFrom(['Mathematics', 'English', 'Integrated Science']),
        level: randomFrom(['Primary', 'JHS', 'SHS']),
        sessions_per_week: String(randomInt(1, 4)),
      };
    case 'Photography':
      return {
        shoot_type: randomFrom(['Graduation', 'Product', 'Corporate']),
        event_date: new Date(Date.now() + randomInt(3, 21) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        deliverables: randomFrom(['50 edited photos', '100 edited photos + album', 'Web + print export']),
      };
    case 'Cleaning':
      return {
        property_size: randomFrom(['2-bedroom apartment', '3-bedroom house', 'Small office']),
        frequency: randomFrom(['One-time', 'Weekly', 'Bi-weekly']),
        supplies_provided: randomFrom(['Yes', 'No']),
      };
    case 'Delivery':
      return {
        pickup_location: randomFrom(['Tema', 'Spintex', 'Asokwa']),
        dropoff_location: randomFrom(['Adenta', 'Labone', 'KNUST area']),
        load_type: randomFrom(['Furniture', 'Parcels', 'Mixed household items']),
      };
    case 'Design & Print':
      return {
        asset_type: randomFrom(['Flyer', 'Logo + cards', 'Banner + poster']),
        quantity: randomFrom(['200 copies', '500 copies', '1000 copies']),
        print_deadline: randomFrom(['3 days', '5 days', '7 days']),
      };
    default:
      return {};
  }
}

function sampleBidProposal(category) {
  const detailByCategory = {
    'Home Repairs': randomFrom(['Tools and parts included', 'Site inspection and parts sourcing included']),
    Tutoring: randomFrom(['Weekly quiz tracking', 'Personalized lesson plan with mock tests']),
    Photography: randomFrom(['Lighting setup and color correction included', 'RAW capture with edited gallery delivery']),
    Cleaning: randomFrom(['Detailed room-by-room checklist', 'Eco-friendly products and sanitization workflow']),
    Delivery: randomFrom(['Live delivery updates and proof of delivery', 'Protective handling and route optimization']),
    'Design & Print': randomFrom(['Concept drafts plus print-ready files', 'Brand-consistent layout with CMYK setup']),
  };

  return {
    timeline_days: randomInt(1, 10),
    supervision_plan: randomFrom(['Daily WhatsApp updates', 'Milestone check-ins every 2 days', 'Before/after proof at each stage']),
    milestone_plan: randomFrom(['Kickoff, draft, final handoff', 'Inspection, execution, QA, handoff', 'Week 1 draft, week 2 revisions, final delivery']),
    category_detail: detailByCategory[category] || 'Category delivery details provided',
  };
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

  for (let i = 0; i < JOB_COUNT; i += 1) {
    const owner = randomFrom(buyers);
    const category = randomFrom(CATEGORIES);
    const sample = randomTemplateForCategory(category);
    const title = sample.title;
    const budget = randomBudgetForCategory(category);
    const hoursUntilDeadline = randomInt(24, 240);
    const deadline = new Date(now + hoursUntilDeadline * 60 * 60 * 1000);

    jobs.push({
      title,
      description: sample.description,
      category,
      intake_details: sampleIntakeDetails(category),
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
        proposal: sampleBidProposal(job.category),
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
