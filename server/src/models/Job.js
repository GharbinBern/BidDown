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

export default mongoose.model('Job', jobSchema);
