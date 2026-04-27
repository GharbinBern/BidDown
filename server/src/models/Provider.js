import mongoose from 'mongoose';

const providerProfileSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  headline: {
    type: String,
    default: '',
    maxlength: 180,
  },
  city: {
    type: String,
    default: 'Accra',
  },
  country: {
    type: String,
    default: 'Ghana',
  },
  is_online: {
    type: Boolean,
    default: false,
  },
  verification: {
    national_id_verified: { type: Boolean, default: false },
    phone_verified: { type: Boolean, default: false },
    background_check_cleared: { type: Boolean, default: false },
    skill_assessment_passed: { type: Boolean, default: false },
    callback_guarantee_active: { type: Boolean, default: false },
    electrical_badge: { type: Boolean, default: false },
  },
  reliability: {
    avg_response_minutes: { type: Number, default: 35 },
    bid_acceptance_rate: { type: Number, default: 68 },
    job_completion_rate: { type: Number, default: 97 },
    on_time_arrival_rate: { type: Number, default: 92 },
    repeat_clients: { type: Number, default: 0 },
    disputes_filed: { type: Number, default: 0 },
  },
  skills: {
    type: [String],
    default: [],
  },
  categories_served: {
    type: [{ name: String, count: Number }],
    default: [],
  },
  weekly_availability: {
    type: [[String]],
    default: [
      ['available', 'available', 'available', 'available', 'available', 'partial', 'off'],
      ['available', 'available', 'available', 'available', 'partial', 'partial', 'off'],
      ['available', 'available', 'available', 'available', 'available', 'off', 'off'],
    ],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

providerProfileSchema.pre('save', function beforeSave(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('ProviderProfile', providerProfileSchema);
