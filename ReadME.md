# BidDown

BidDown is a reverse-auction marketplace where buyers post jobs and sellers compete by offering lower bids.

## What The App Does

- Buyers create jobs with a budget and deadline.
- Sellers submit bids on open jobs.
- Buyers compare bids and choose a winner.
- Users can leave reviews after work is completed.
- Basic analytics show activity and marketplace trends.

## Tech Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB Atlas
- Auth: JWT
- Payments: Stripe

## Quick Start

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

Set your backend `.env` values:

```env
MONGODB_URI=mongodb+srv://<cluster-host>/biddown
JWT_SECRET=your-secret-key-min-32-chars
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLIC_KEY=pk_test_xxxxx
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
```

### 2. Frontend

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Set your frontend `.env` values:

```env
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PUBLIC_KEY=pk_test_xxxxx
```

## Project Structure

- `client/` - React frontend
- `server/` - Express API and MongoDB models

## Status

MVP ready for local development and deployment.
