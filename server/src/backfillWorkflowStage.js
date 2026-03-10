import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Job from './models/Job.js';

dotenv.config();

const inferWorkflowStage = (job) => {
  if (!job.winning_bid_id) return 'bidding';
  if (job.status === 'completed' || job.escrow_released) return 'completed';
  if (job.dispute_raised) return 'dispute';
  if (job.work_submitted_at || job.review_deadline) return 'review';
  if (
    job.escrow_deposited_at ||
    job.work_started_at ||
    (Array.isArray(job.progress_updates) && job.progress_updates.length > 0)
  ) {
    return 'in_progress';
  }
  return 'contract';
};

const buildContractTerms = (job) => ({
  scope: job.contract_terms?.scope || job.description,
  deadline: job.contract_terms?.deadline || job.deadline,
  agreed_price: job.contract_terms?.agreed_price || job.escrow_amount || job.budget,
  buyer_confirmed: Boolean(job.contract_terms?.buyer_confirmed),
  seller_confirmed: Boolean(job.contract_terms?.seller_confirmed),
  confirmed_at: job.contract_terms?.confirmed_at || null,
});

async function run() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is missing in server/.env');
  }

  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });

  const jobs = await Job.find({});
  let updated = 0;
  let unchanged = 0;

  for (const job of jobs) {
    const nextStage = inferWorkflowStage(job);
    const nextContract = buildContractTerms(job);

    const stageChanged = job.workflow_stage !== nextStage;
    const contractMissing = !job.contract_terms?.scope || !job.contract_terms?.deadline || !job.contract_terms?.agreed_price;

    if (!stageChanged && !contractMissing) {
      unchanged += 1;
      continue;
    }

    job.workflow_stage = nextStage;
    job.contract_terms = nextContract;
    job.updatedAt = new Date();

    await job.save();
    updated += 1;
  }

  console.log(`Workflow backfill complete. Updated: ${updated}, unchanged: ${unchanged}, total: ${jobs.length}`);
}

run()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('Workflow backfill failed:', err.message);
    await mongoose.disconnect();
    process.exit(1);
  });
