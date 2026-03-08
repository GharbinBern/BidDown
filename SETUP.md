# BidDown – Setup & Deployment Guide

## Prerequisites

- Node.js 16+
- MongoDB Atlas account (free tier works)
- Stripe account (for payments)
- GitHub account (for deployment)
- Vercel account (for frontend)
- Railway account (for backend)

## Local Development

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/biddown.git
cd biddown
```

### 2. Setup Backend

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env` with your credentials:
```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/biddown
JWT_SECRET=your-secret-key-min-32-chars
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLIC_KEY=pk_test_xxxxx
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
```

Start the server:
```bash
npm run dev
```

Server runs on `http://localhost:5000`

### 3. Setup Frontend

```bash
cd ../client
npm install
cp .env.example .env
```

Edit `.env`:
```
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PUBLIC_KEY=pk_test_xxxxx
```

Start the app:
```bash
npm run dev
```

App runs on `http://localhost:3000`

## Running Both Locally

Open two terminals:

**Terminal 1:**
```bash
cd server && npm run dev
```

**Terminal 2:**
```bash
cd client && npm run dev
```

Both run in development mode with hot reload.

## Production Deployment

### Backend → Railway

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial BidDown commit"
   git push origin main
   ```

2. **Create Railway Account** → https://railway.app

3. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your biddown repo
   - Select the `server` directory

4. **Add Environment Variables** in Railway dashboard:
   ```
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_secret
   STRIPE_SECRET_KEY=your_key
   STRIPE_PUBLIC_KEY=your_key
   NODE_ENV=production
   CLIENT_URL=https://your-vercel-domain.vercel.app
   ```

5. **Deploy**
   - Railway auto-deploys on push
   - Get your API URL from Railway (e.g., `https://biddown-api.up.railway.app`)

### Frontend → Vercel

1. **Build the frontend**
   ```bash
   cd client
   npm run build
   ```

2. **Create Vercel Account** → https://vercel.com

3. **Deploy**
   - Connect your GitHub repo
   - Select `client` as root directory
   - Add environment variables:
     ```
     VITE_API_URL=https://biddown-api.up.railway.app (your Railway URL)
     VITE_STRIPE_PUBLIC_KEY=pk_test_xxxxx
     ```
   - Deploy

4. **Update Backend**
   - Update `CLIENT_URL` in Railway to your Vercel domain

## Database Setup

### MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create a database user
4. Get your connection string
5. Add your IP to whitelist
6. Use the connection string in `.env`

The collections will auto-create when you first run the server.

## API Documentation

See [API.md](./API.md) for full endpoint documentation.

## Testing

### Create a test job
```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Logo Design",
    "description": "Need a modern logo",
    "budget": 500,
    "category": "Design",
    "deadline": "2024-03-01T00:00:00Z"
  }'
```

### Submit a test bid
```bash
curl -X POST http://localhost:5000/api/bids \
  -H "Authorization: Bearer YOUR_SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "job_id": "JOB_ID_HERE",
    "amount": 400,
    "note": "I can deliver in 3 days"
  }'
```

## Troubleshooting

**"Cannot find module"**
→ Run `npm install` in both client and server directories

**"MongooseError: Cannot connect"**
→ Check your MONGODB_URI is correct and IP is whitelisted

**"CORS error"**
→ Make sure CLIENT_URL in server matches your frontend URL

**"Stripe key error"**
→ Check you're using test keys (sk_test_, pk_test_)

## Next Steps

1. Test locally with dummy data
2. Deploy to Railway (backend) first
3. Deploy to Vercel (frontend) second
4. Update environment variables
5. Test the production app
6. Setup monitoring & logs
7. Configure custom domain

For questions, check the README.md or reach out!
