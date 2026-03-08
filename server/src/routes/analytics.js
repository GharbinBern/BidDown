import express from 'express';
import Job from '../models/Job.js';
import Bid from '../models/Bid.js';

const router = express.Router();

// Market-wide analytics
router.get('/market', async (req, res, next) => {
  try {
    const totalJobs = await Job.countDocuments();
    const openJobs = await Job.countDocuments({ status: 'open' });
    const closedJobs = await Job.countDocuments({ status: 'closed' });
    const completedJobs = await Job.countDocuments({ status: 'completed' });

    const jobData = await Job.aggregate([
      { $match: { status: { $in: ['closed', 'completed'] } } },
      {
        $group: {
          _id: null,
          totalBudget: { $sum: '$budget' },
          avgBudget: { $avg: '$budget' },
          totalJobs: { $sum: 1 },
        },
      },
    ]);

    const winningBids = await Bid.aggregate([
      { $match: { status: 'accepted' } },
      {
        $group: {
          _id: null,
          totalBidAmount: { $sum: '$amount' },
          avgBidAmount: { $avg: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const savings = jobData[0] && winningBids[0]
      ? {
          totalBudget: jobData[0].totalBudget,
          totalSpent: winningBids[0].totalBidAmount,
          totalSavings: jobData[0].totalBudget - winningBids[0].totalBidAmount,
          avgSavingsPercent: (
            ((jobData[0].totalBudget - winningBids[0].totalBidAmount) / jobData[0].totalBudget) * 100
          ).toFixed(2),
        }
      : { totalBudget: 0, totalSpent: 0, totalSavings: 0, avgSavingsPercent: 0 };

    res.json({
      jobs: {
        total: totalJobs,
        open: openJobs,
        closed: closedJobs,
        completed: completedJobs,
      },
      savings,
    });
  } catch (err) {
    next(err);
  }
});

// Analytics by category
router.get('/categories', async (req, res, next) => {
  try {
    const categoryData = await Job.aggregate([
      { $match: { status: { $in: ['closed', 'completed'] } } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgBudget: { $avg: '$budget' },
          minBudget: { $min: '$budget' },
          maxBudget: { $max: '$budget' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Get winning bid data by category
    const bidsByCategory = await Job.aggregate([
      { $match: { status: { $in: ['closed', 'completed'] }, winning_bid_id: { $ne: null } } },
      {
        $lookup: {
          from: 'bids',
          localField: 'winning_bid_id',
          foreignField: '_id',
          as: 'winningBid',
        },
      },
      { $unwind: '$winningBid' },
      {
        $group: {
          _id: '$category',
          avgWinningBid: { $avg: '$winningBid.amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Combine data
    const result = categoryData.map(cat => {
      const bidData = bidsByCategory.find(b => b._id === cat._id);
      const avgSavings = bidData
        ? (((cat.avgBudget - bidData.avgWinningBid) / cat.avgBudget) * 100).toFixed(2)
        : 0;

      return {
        category: cat._id,
        jobCount: cat.count,
        avgBudget: cat.avgBudget.toFixed(2),
        avgWinningBid: bidData ? bidData.avgWinningBid.toFixed(2) : 0,
        avgSavingsPercent: avgSavings,
      };
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Bid analysis
router.get('/bids', async (req, res, next) => {
  try {
    const jobsWithBids = await Job.aggregate([
      { $match: { bids_count: { $gt: 0 } } },
      {
        $group: {
          _id: null,
          avgBidsPerJob: { $avg: '$bids_count' },
          maxBids: { $max: '$bids_count' },
          minBids: { $min: '$bids_count' },
          totalJobs: { $sum: 1 },
        },
      },
    ]);

    const bidDistribution = await Job.aggregate([
      { $match: { bids_count: { $gt: 0 } } },
      {
        $group: {
          _id: {
            $cond: [{ $lte: ['$bids_count', 3] }, '1-3', 
              { $cond: [{ $lte: ['$bids_count', 6] }, '4-6', '7+'] }
            ],
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      stats: jobsWithBids[0] || {},
      distribution: bidDistribution,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
