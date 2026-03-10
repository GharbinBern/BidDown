import express from 'express';
import stripe from 'stripe';
import Job from '../models/Job.js';
import Bid from '../models/Bid.js';
import { authMiddleware } from '../middleware/auth.js';

const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

// Create payment intent (buyer paying for job)
router.post('/create-intent', authMiddleware, async (req, res, next) => {
  try {
    const { job_id } = req.body;

    const job = await Job.findById(job_id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check user is the job owner
    if (job.owner_id.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Check job has a winning bid
    if (!job.winning_bid_id) {
      return res.status(400).json({ error: 'No winning bid on this job' });
    }

    if (job.workflow_stage !== 'escrow') {
      return res.status(400).json({ error: 'Payment intent can only be created during escrow stage' });
    }

    // Create payment intent
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: Math.round(job.escrow_amount * 100), // Amount in cents
      currency: 'usd',
      metadata: {
        job_id: job_id.toString(),
        buyer_id: req.userId,
      },
      description: `Payment for job: ${job.title}`,
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    next(err);
  }
});

// Confirm payment and secure funds in escrow
router.post('/confirm', authMiddleware, async (req, res, next) => {
  try {
    const { job_id, payment_intent_id } = req.body;

    const job = await Job.findById(job_id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.owner_id.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Verify payment with Stripe
    const paymentIntent = await stripeClient.paymentIntents.retrieve(payment_intent_id);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not successful' });
    }

    // Escrow is funded, work can begin.
    job.escrow_released = false;
    job.escrow_deposited_at = new Date();
    job.payment_intent_id = payment_intent_id;
    if (job.workflow_stage === 'escrow') {
      job.workflow_stage = 'in_progress';
    }
    await job.save();

    res.json({
      message: 'Payment confirmed and funds secured in escrow',
      job,
    });
  } catch (err) {
    next(err);
  }
});

// Webhook for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res, next) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripeClient.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const jobId = paymentIntent.metadata.job_id;

      // Update job escrow funding marker.
      await Job.findByIdAndUpdate(jobId, {
        escrow_released: false,
        escrow_deposited_at: new Date(),
        workflow_stage: 'in_progress',
      });

      console.log(`Payment succeeded for job ${jobId}`);
    }

    res.json({ received: true });
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

export default router;
