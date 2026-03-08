# BidDown – Production-Ready Fullstack Application

A reverse auction marketplace built with Node.js, React, MongoDB, and JWT authentication. Buyers post jobs, sellers bid, competitions drive prices down.

## Architecture Overview

```
biddown/
├── client/               # React frontend (deployed to Vercel)
│   ├── src/
│   ├── public/
│   └── package.json
├── server/               # Node.js + Express backend (deployed to Railway)
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── models/       # MongoDB schemas
│   │   ├── middleware/   # Auth, error handling, etc.
│   │   ├── controllers/  # Business logic
│   │   └── config/       # Configuration
│   ├── .env.example
│   └── package.json
├── .gitignore
└── README.md (you are here)
```

## Quick Start

### Prerequisites
- Node.js 16+
- MongoDB Atlas account (free tier works)
- Stripe account (for payments)

### Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI, Stripe keys, JWT secret
npm run dev
```

Server runs on `http://localhost:5000`

### Frontend Setup

```bash
cd client
npm install
cp .env.example .env
# Set REACT_APP_API_URL=http://localhost:5000
npm run dev
```

App opens at `http://localhost:3000`

## API Endpoints

### Auth
- `POST /api/auth/register` – Create account
- `POST /api/auth/login` – Get JWT token
- `POST /api/auth/logout` – Clear session
- `GET /api/auth/me` – Get current user

### Jobs
- `GET /api/jobs` – List all jobs
- `GET /api/jobs/:id` – Job details + bids
- `POST /api/jobs` – Create job (auth required)
- `PUT /api/jobs/:id` – Update job (owner only)
- `DELETE /api/jobs/:id` – Delete job (owner only)
- `POST /api/jobs/:id/close` – Accept a bid and close auction

### Bids
- `POST /api/bids` – Submit sealed bid (auth required)
- `GET /api/bids/my-bids` – User's bid history
- `GET /api/jobs/:jobId/bids` – All bids on a job (owner only)

### Reviews
- `POST /api/reviews` – Leave review after job completion
- `GET /api/sellers/:id/reviews` – Seller's review history

### Analytics
- `GET /api/analytics/market` – Market-wide stats
- `GET /api/analytics/categories` – Category breakdowns
- `GET /api/analytics/savings` – Average savings data

### Payments
- `POST /api/payments/create-intent` – Stripe payment intent
- `POST /api/payments/confirm` – Confirm payment & release funds

## Database Schema

### Users
```javascript
{
  _id, email, password (hashed), name, avatar, role: ["buyer", "seller"],
  verified, createdAt, updatedAt,
  seller_profile: {
    bio, hourly_rate, rating, reviews_count, completion_rate
  }
}
```

### Jobs
```javascript
{
  _id, title, description, budget, category, deadline,
  owner_id (ref: User), status: ["open", "closed", "completed"],
  winning_bid_id (ref: Bid), createdAt, updatedAt
}
```

### Bids
```javascript
{
  _id, job_id (ref: Job), seller_id (ref: User), amount, note,
  sealed: true (until deadline), createdAt, updatedAt
}
```

### Reviews
```javascript
{
  _id, reviewer_id (ref: User), seller_id (ref: User), job_id (ref: Job),
  rating: 1-5, comment, createdAt
}
```

## Environment Variables

### Server (.env)
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/biddown
JWT_SECRET=your-super-secret-key-min-32-chars
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
NODE_ENV=development
PORT=5000
```

### Client (.env)
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_...
```

## Deployment

### Frontend (to Vercel)
```bash
cd client
npm run build
# Push to GitHub, connect to Vercel
# Environment variables needed: REACT_APP_API_URL (production backend URL)
```

### Backend (to Railway)
```bash
# Push to GitHub
# Create Railway project, connect GitHub repo
# Add environment variables: MONGODB_URI, JWT_SECRET, STRIPE_SECRET_KEY, etc.
# Railway handles the rest
```

## Features

### Core
- ✅ User registration (buyer + seller roles)
- ✅ Post jobs with budget cap & deadline
- ✅ Sealed-bid reverse auction
- ✅ Bid submission & management
- ✅ Job acceptance & closure
- ✅ JWT authentication

### Extended
- ✅ Seller profiles + ratings
- ✅ Review system (buyers rate sellers)
- ✅ Payment processing (Stripe)
- ✅ Escrow (funds held until completion)
- ✅ Real-time notifications (coming soon)
- ✅ Market analytics & insights
- ✅ Search & filtering by category
- ✅ Dashboard for buyers & sellers

## Tech Stack

**Frontend:**
- React 18
- React Router (navigation)
- Axios (API calls)
- Stripe.js (payments)
- TailwindCSS (styling)

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT (authentication)
- Bcrypt (password hashing)
- Stripe API
- Cors, dotenv, morgan (utilities)

## Project Timeline (Your Class)

**Week 1:** Problem framing + design  
**Week 2:** Core build (jobs, bids, auth)  
**Week 3:** Auction mechanics (bid reveal, accept)  
**Week 4:** Game theory layer (analytics, Nash equilibrium)  
**Week 5:** Evaluation + writeup

This codebase covers Weeks 2-4. Use Week 1 for understanding the economics, and Week 5 for your paper + presentation.

## For Your Economics Paper

**Data You Can Analyze:**
- Average bid discount (% below budget cap by category)
- Bid clustering (Nash equilibrium visualization)
- Seller rating correlation with winning bids
- Time-to-close by category
- Total buyer savings across all jobs

**Research Questions:**
- Do reverse auctions reduce information asymmetry?
- How much buyer surplus is created?
- Does seller quality (rating) affect bid behavior?
- Is Nash equilibrium reached empirically?

## Contributing

This is your class project. Feel free to fork, modify, and customize for your specific needs.

## License

MIT

---

**Built for:** Economics capstone (Spring 2026)  
**Status:** Production-ready MVP  
**Next:** Deploy, test, and analyze market behavior
