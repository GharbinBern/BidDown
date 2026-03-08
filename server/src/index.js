import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import bidRoutes from './routes/bids.js';
import reviewRoutes from './routes/reviews.js';
import analyticsRoutes from './routes/analytics.js';
import paymentRoutes from './routes/payments.js';

import errorHandler from './middleware/errorHandler.js';

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('Missing JWT_SECRET in server/.env. Set a long random string and restart the server.');
  process.exit(1);
}

// Fail fast if MongoDB is unavailable instead of buffering model operations.
mongoose.set('bufferCommands', false);

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3001',
  credentials: true,
}));

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI;
const hasPlaceholderMongoUri =
  !mongoUri ||
  mongoUri.includes('username:password@') ||
  mongoUri.includes('cluster.mongodb.net');

if (hasPlaceholderMongoUri) {
  console.warn('⚠ MongoDB URI is not configured. Update server/.env MONGODB_URI with your real Atlas URI or a local URI (mongodb://127.0.0.1:27017/biddown).');
} else {
  mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
  }).then(() => {
    console.log('Connected to MongoDB');
  }).catch(err => {
    console.warn('⚠ MongoDB connection error (development mode continues):', err.message);
  });
}

const requireDbConnection = (req, res, next) => {
  // 1 = connected, 2 = connecting, 0 = disconnected, 3 = disconnecting
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: 'Database unavailable. Verify MONGODB_URI and Atlas network/DNS settings.',
    });
  }
  next();
};

// Routes
app.use('/api/auth', requireDbConnection, authRoutes);
app.use('/api/jobs', requireDbConnection, jobRoutes);
app.use('/api/bids', requireDbConnection, bidRoutes);
app.use('/api/reviews', requireDbConnection, reviewRoutes);
app.use('/api/analytics', requireDbConnection, analyticsRoutes);
app.use('/api/payments', requireDbConnection, paymentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler (last middleware)
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`BidDown server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
