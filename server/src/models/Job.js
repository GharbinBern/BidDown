import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  // Core Details
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Design', 'Development', 'Marketing', 'Writing', 'Legal', 'Consulting', 'Other'],
    default: 'Other',
  },

  // Budget & Timeline
  budget: {
    type: Number,
    required: true,
    min: 50,
  },
  deadline: {
    type: Date,
    required: true,
  },

  // Ownership & Status
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'completed', 'cancelled'],
    default: 'open',
  },

  workflow_stage: {
    type: String,
    enum: ['bidding', 'contract', 'escrow', 'in_progress', 'review', 'dispute', 'completed'],
    default: 'bidding',
  },

  // Auction Details
  winning_bid_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid',
    default: null,
  },
  bids_count: {
    type: Number,
    default: 0,
  },
  sealed_until: {
    type: Date,
    required: true,
  },

  // Completion & Payment
  completion_date: Date,
  rating_given: Boolean,
  escrow_amount: Number,
  escrow_released: Boolean,
  payment_intent_id: String,
  payment_released_at: Date,

  contract_terms: {
    scope: String,
    deadline: Date,
    agreed_price: Number,
    buyer_confirmed: {
      type: Boolean,
      default: false,
    },
    seller_confirmed: {
      type: Boolean,
      default: false,
    },
    confirmed_at: Date,
  },

  escrow_deposited_at: Date,

  work_started_at: Date,
  progress_updates: {
    type: [
      {
        message: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    default: [],
  },
  work_submitted_at: Date,
  deliverable_note: String,
  deliverable_url: String,

  review_deadline: Date,
  revision_rounds_used: {
    type: Number,
    default: 0,
  },

  dispute_raised: {
    type: Boolean,
    default: false,
  },
  dispute_reason: String,
  dispute_raised_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  dispute_raised_at: Date,

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for common queries
jobSchema.index({ owner_id: 1, status: 1 });
jobSchema.index({ category: 1, status: 1 });
jobSchema.index({ deadline: 1 });
jobSchema.index({ workflow_stage: 1, review_deadline: 1 });

export default mongoose.model('Job', jobSchema);
