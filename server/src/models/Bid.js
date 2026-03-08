import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema({
  // References
  job_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  seller_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // Bid Details
  amount: {
    type: Number,
    required: true,
    min: 50,
  },
  note: {
    type: String,
    maxlength: 1000,
  },

  // Sealed Until Job Deadline
  sealed: {
    type: Boolean,
    default: true,
  },

  // Status
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending',
  },

  // If Accepted
  accepted_date: Date,

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
bidSchema.index({ job_id: 1, status: 1 });
bidSchema.index({ seller_id: 1 });
bidSchema.index({ job_id: 1, amount: 1 }); // For sorting bids by amount

export default mongoose.model('Bid', bidSchema);
