# Quick Start Reference

## Project Structure

```
biddown/
├── server/                 # Node.js + Express API
│   ├── src/
│   │   ├── index.js       # Server entry point
│   │   ├── models/        # MongoDB schemas
│   │   │   ├── User.js
│   │   │   ├── Job.js
│   │   │   ├── Bid.js
│   │   │   └── Review.js
│   │   ├── routes/        # API endpoints
│   │   │   ├── auth.js
│   │   │   ├── jobs.js
│   │   │   ├── bids.js
│   │   │   ├── reviews.js
│   │   │   ├── analytics.js
│   │   │   └── payments.js
│   │   └── middleware/    # Auth, errors, etc
│   ├── .env.example
│   └── package.json
│
├── client/                # React + Vite frontend
│   ├── src/
│   │   ├── main.jsx       # Entry point
│   │   ├── App.jsx        # Routing
│   │   ├── api.js         # API client
│   │   ├── store.js       # State management (Zustand)
│   │   ├── index.css      # Tailwind
│   │   ├── components/    # UI components
│   │   │   └── Navbar.jsx
│   │   └── pages/         # Page components
│   │       ├── HomePage.jsx
│   │       ├── RegisterPage.jsx
│   │       ├── LoginPage.jsx
│   │       ├── MarketplacePage.jsx
│   │       ├── JobDetailPage.jsx
│   │       ├── DashboardPage.jsx
│   │       └── AnalyticsPage.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   └── package.json
│
├── README.md              # Project overview
├── API.md                 # Endpoint documentation
├── SETUP.md               # Setup & deployment guide
└── .gitignore
```

## Local Development

### Terminal 1 - Backend
```bash
cd server
npm install
cp .env.example .env
# Edit .env with MongoDB URI, JWT secret, Stripe keys
npm run dev
# Server: http://localhost:5000
```

### Terminal 2 - Frontend
```bash
cd client
npm install
cp .env.example .env
# Edit .env with API URL and Stripe key
npm run dev
# App: http://localhost:3000
```

## Key Technologies

**Backend:**
- Express.js - Web framework
- MongoDB + Mongoose - Database
- JWT - Authentication
- Stripe - Payments
- Node.js 16+

**Frontend:**
- React 18 - UI framework
- Vite - Build tool
- TailwindCSS - Styling
- React Router - Navigation
- Axios - HTTP client
- Zustand - State management
- React Hot Toast - Notifications

## Database Models

### User
- Email, password (hashed), name
- Roles (buyer, seller)
- Seller profile (bio, rate, portfolio)
- Stats (rating, review count, jobs completed)

### Job
- Title, description, budget, category
- Owner (buyer who posted)
- Status (open, closed, completed)
- Deadline / sealed until
- Winning bid reference
- Escrow information

### Bid
- Job reference, seller reference
- Amount, note
- Status (pending, accepted, rejected, withdrawn)
- Sealed flag

### Review
- Job, buyer, seller references
- Rating (1-5), comment
- Quality/communication/timeliness ratings

## API Endpoints (Key)

**Auth:**
- `POST /auth/register` - Create account
- `POST /auth/login` - Get JWT token
- `GET /auth/me` - Current user

**Jobs:**
- `GET /jobs` - List jobs
- `GET /jobs/:id` - Job details
- `POST /jobs` - Create job
- `POST /jobs/:id/close` - Accept bid

**Bids:**
- `POST /bids` - Submit bid
- `GET /bids/my-bids` - User's bids
- `GET /bids/job/:jobId` - Job's bids (owner only)

**Analytics:**
- `GET /analytics/market` - Overall stats
- `GET /analytics/categories` - By category
- `GET /analytics/bids` - Bid distribution

See API.md for complete documentation.

## Common Commands

### Backend
```bash
npm run dev          # Start dev server
npm start            # Start production
npm test             # Run tests (TODO)
```

### Frontend
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

## Environment Variables

### Server (.env)
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=long-secret-key-min-32-chars
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
```

### Client (.env)
```
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

## Deployment Checklist

- [ ] Push to GitHub
- [ ] Setup Railway account (backend)
- [ ] Connect GitHub repo to Railway
- [ ] Add environment variables to Railway
- [ ] Setup Vercel account (frontend)
- [ ] Connect GitHub repo to Vercel
- [ ] Add environment variables to Vercel
- [ ] Update CORS in server with Vercel URL
- [ ] Test production app
- [ ] Setup custom domain (optional)
- [ ] Monitor logs & errors

## File Size Guide

- Server node_modules: ~150MB
- Client node_modules: ~250MB
- Client build: ~100KB (gzipped)

## Next Features (Future)

- Real-time notifications (Socket.io)
- Email notifications
- Stripe escrow + release
- Seller verification
- Image uploads
- Chat between buyer/seller
- Admin dashboard
- Mobile app (React Native)
- Dispute resolution
- Tax reporting

## Support & Documentation

- **README.md** - Project overview
- **API.md** - Endpoint docs
- **SETUP.md** - Setup & deployment
- **GitHub Issues** - Bug reports
- **Email** - Contact support

## License

MIT - Built for economic research & education
