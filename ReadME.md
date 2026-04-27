# BraFom

[BraFom](https://brafom.vercel.app/) is a reverse-auction marketplace built for the Ghanaian market. Buyers post jobs with a budget ceiling, and service providers compete by bidding lower. The buyer reviews all bids and awards the contract to their preferred provider.

## How It Works

1. **Buyer posts a job** with a title, description, budget, category, and deadline.
2. **Sellers browse and bid** — each bid includes a proposed price and a short pitch.
3. **Bids are sealed** from other sellers during the open window to prevent strategic undercutting.
4. **Buyer awards the job** by accepting one bid, which moves the job into the active workflow.
5. **Workflow progresses** through defined stages (e.g. contract signed, in progress, delivered, complete).
6. **Both sides leave reviews** after completion, building reputation scores over time.


## Core Features

- Buyer and seller authentication with JWT
- Job posting with category, budget, deadline, and intake details
- Sealed bidding — bids hidden from competing sellers until deadline
- Buyer-side bid award and contract workflow tracking
- Escrow-ready data model (Stripe config included)
- Review and rating system for completed jobs
- Provider profiles with portfolio, hourly rate, and reputation stats
- Dashboard showing active jobs, bid history, and earnings
- Analytics endpoints for marketplace trends and category breakdowns
- Notification feed for bid activity and job status changes

## Tech Stack

- Frontend: React, Vite, Zustand, React Router, Axios
- Backend: Node.js, Express, Mongoose
- Database: MongoDB
- Auth: JWT

## Monorepo Structure

```text
biddown/
	client/
		src/
			App.jsx
			api.js
			store.js
			styles.js
			components/
				Navbar.jsx
			pages/
				Browse.jsx
				Dashboard.jsx
				Home.jsx
				Job.jsx
				Login.jsx
				Notifications.jsx
				PostJob.jsx
				ProviderProfile.jsx
				Register.jsx
				Settings.jsx
	server/
		src/
			server.js
			seed.js
			scripts/
				backfill.js
			middleware/
				auth.js
				errors.js
			models/
				Bid.js
				Job.js
				Provider.js
				Review.js
				User.js
			routes/
				analytics.js
				auth.js
				bids.js
				jobs.js
				reviews.js
	API.md
	QUICKSTART.md
	SETUP.md
```

## Local Development

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

Backend default runtime values are read from server/.env.example:

```env
MONGODB_URI=mongodb+srv://<cluster-host>/biddown?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-at-least-32-characters-long-change-this
STRIPE_SECRET_KEY=sk_test_your_stripe_key_here
STRIPE_PUBLIC_KEY=pk_test_your_stripe_key_here
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

Frontend values from client/.env.example:

```env
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_key_here
```

## Useful Scripts

### Server

```bash
npm run dev               # Start API with nodemon
npm start                 # Start API in normal mode
npm run validate          # Basic node --check validation
```

### Client

```bash
npm run dev      # Start Vite dev server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # ESLint checks for src
```

## API Surface (Current)

- Auth: /api/auth
- Jobs: /api/jobs
- Bids: /api/bids
- Reviews: /api/reviews
- Analytics: /api/analytics

See API.md for endpoint-level details.


