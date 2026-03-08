import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // Basic Info
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /.+\@.+\..+/,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  name: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: null,
  },

  // Role & Verification
  roles: {
    type: [String],
    enum: ['buyer', 'seller'],
    default: ['buyer'],
  },
  verified: {
    type: Boolean,
    default: false,
  },

  // Seller Profile (if seller role)
  seller_profile: {
    bio: String,
    hourly_rate: Number,
    portfolio_url: String,
  },

  // Stats
  average_rating: {
    type: Number,
    default: 5.0,
    min: 1,
    max: 5,
  },
  reviews_count: {
    type: Number,
    default: 0,
  },
  total_jobs_completed: {
    type: Number,
    default: 0,
  },
  response_rate: {
    type: Number,
    default: 100,
  },

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

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

// Method to get public profile (without password)
userSchema.methods.getPublicProfile = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

export default mongoose.model('User', userSchema);
