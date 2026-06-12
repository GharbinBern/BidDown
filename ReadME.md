# BraFom

[BraFom](https://brafom.vercel.app/) is a reverse-auction marketplace built for the Ghanaian market. Buyers post jobs with a budget ceiling, and service providers compete by bidding lower. The buyer reviews all bids and awards the contract to their preferred provider.

## How It Works

1. **Buyer posts a job** with a title, description, budget, category, and deadline.
2. **Sellers browse and bid** — each bid includes a proposed price and a short pitch.
3. **Bids are sealed** from other sellers during the open window to prevent strategic undercutting.
4. **Buyer awards the job** by accepting one bid, which moves the job into the active workflow.
5. **Workflow progresses** through defined stages — contract signed, in progress, delivered, complete.
6. **Both sides leave reviews** after completion, building reputation scores over time.

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React, Vite, Zustand, React Router |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB |
| Auth | JWT |

## Quick Start

**Prerequisites:** Node.js 18+, MongoDB instance (local or Atlas)

**1. Clone the repo**
```bash
git clone https://github.com/GharbinBern/BraFom.git
cd BraFom
```

**2. Backend**

Copy the example env file and fill in your values, then start the server:
```bash
cd server
npm install
cp .env.example .env
npm run dev   # http://localhost:5000
```

```env
MONGODB_URI=mongodb+srv://<cluster-host>/biddown?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-at-least-32-characters-long-change-this
STRIPE_SECRET_KEY=sk_test_your_stripe_key_here
STRIPE_PUBLIC_KEY=pk_test_your_stripe_key_here
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
```

**3. Frontend**

In a separate terminal, copy the client env file and start the dev server:
```bash
cd client
npm install
cp .env.example .env
npm run dev   # http://localhost:3000
```

```env
VITE_API_URL=http://localhost:5000

```
