import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  // References
  job_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  buyer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  seller_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // Review Content
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    maxlength: 2000,
  },

  // Review Aspects
  quality_rating: Number,
  communication_rating: Number,
  timeliness_rating: Number,

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for common queries
reviewSchema.index({ seller_id: 1 });
reviewSchema.index({ job_id: 1 });

export default mongoose.model('Review', reviewSchema);
