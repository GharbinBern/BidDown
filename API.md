# BidDown API Documentation

Base URL: `/api`

All endpoints require JSON format. Authentication uses Bearer tokens in the `Authorization` header.

## Authentication

### Register
```
POST /auth/register
```
**Body:**
```json
{
  "email": "user@example.com",
  "password": "secure-password",
  "name": "John Doe",
  "roles": ["buyer"] // or ["seller"] or ["buyer", "seller"]
}
```
**Response:**
```json
{
  "token": "jwt_token_here",
  "user": { /* user object */ }
}
```

### Login
```
POST /auth/login
```
**Body:**
```json
{
  "email": "user@example.com",
  "password": "secure-password"
}
```
**Response:**
```json
{
  "token": "jwt_token_here",
  "user": { /* user object */ }
}
```

### Get Current User
```
GET /auth/me
Authorization: Bearer {token}
```
**Response:**
```json
{
  "_id": "user_id",
  "email": "user@example.com",
  "name": "John Doe",
  "roles": ["buyer"],
  "average_rating": 4.8,
  "reviews_count": 12
}
```

---

## Jobs

### List Jobs
```
GET /jobs?category=Design&status=open&page=1&limit=20&search=logo
```
**Query Parameters:**
- `category` - Design, Development, Marketing, Writing, Legal, Consulting, Other
- `status` - open, closed, completed
- `page` - pagination (default 1)
- `limit` - items per page (default 20, max 100)
- `search` - search in title and description

**Response:**
```json
{
  "jobs": [
    {
      "_id": "job_id",
      "title": "Logo Design",
      "description": "Modern logo for fintech startup",
      "budget": 800,
      "category": "Design",
      "deadline": "2024-03-01T00:00:00Z",
      "owner_id": { /* user object */ },
      "status": "open",
      "bids_count": 5,
      "createdAt": "2024-02-20T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 145,
    "pages": 8
  }
}
```

### Get Job Details
```
GET /jobs/:id
```
**Response:**
```json
{
  "_id": "job_id",
  "title": "Logo Design",
  "description": "Modern logo for fintech startup",
  "budget": 800,
  "category": "Design",
  "deadline": "2024-03-01T00:00:00Z",
  "owner_id": { /* user object */ },
  "status": "open",
  "bids": [
    {
      "_id": "bid_id",
      "amount": 650,
      "note": "I can deliver in 5 days",
      "seller_id": { /* user object */ },
      "created_at": "2024-02-20T12:00:00Z"
    }
  ],
  "bids_count": 1,
  "sealed_until": "2024-03-01T00:00:00Z",
  "createdAt": "2024-02-20T00:00:00Z"
}
```

### Create Job
```
POST /jobs
Authorization: Bearer {token}
```
**Body:**
```json
{
  "title": "Logo Design",
  "description": "Modern logo for fintech startup...",
  "budget": 800,
  "category": "Design",
  "deadline": "2024-03-01T00:00:00Z"
}
```
**Response:** 201 Created with job object

### Update Job
```
PUT /jobs/:id
Authorization: Bearer {token}
```
**Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "deadline": "2024-03-05T00:00:00Z"
}
```
**Response:** Updated job object

### Delete Job
```
DELETE /jobs/:id
Authorization: Bearer {token}
```
Only owners can delete open jobs.

**Response:**
```json
{
  "message": "Job deleted"
}
```

### Close Job & Accept Bid
```
POST /jobs/:id/close
Authorization: Bearer {token}
```
**Body:**
```json
{
  "bid_id": "winning_bid_id"
}
```
**Response:**
```json
{
  "message": "Bid accepted",
  "job": { /* updated job */ },
  "bid": { /* winning bid */ }
}
```

---

## Bids

### Submit Bid
```
POST /bids
Authorization: Bearer {token}
```
**Body:**
```json
{
  "job_id": "job_id",
  "amount": 650,
  "note": "I can deliver in 5 days with unlimited revisions"
}
```
**Response:** 201 Created with bid object

**Validation:**
- Bid amount must be > $50
- Bid amount must be ≤ job budget
- User cannot bid on own job
- User can only bid once per job
- Job must be open

### Get My Bids
```
GET /bids/my-bids
Authorization: Bearer {token}
```
**Response:**
```json
[
  {
    "_id": "bid_id",
    "job_id": { /* job object */ },
    "amount": 650,
    "note": "I can deliver in 5 days",
    "status": "pending",
    "createdAt": "2024-02-20T12:00:00Z"
  }
]
```

### Get Job Bids (Owner Only)
```
GET /bids/job/:jobId
Authorization: Bearer {token}
```
Only the job owner can view all bids.

**Response:**
```json
[
  {
    "_id": "bid_id",
    "amount": 650,
    "note": "5 day delivery...",
    "seller_id": { /* user object */ },
    "status": "pending"
  }
]
```

### Withdraw Bid
```
POST /bids/:id/withdraw
Authorization: Bearer {token}
```
**Response:**
```json
{
  "message": "Bid withdrawn"
}
```

---

## Reviews

### Create Review
```
POST /reviews
Authorization: Bearer {token}
```
**Body:**
```json
{
  "job_id": "job_id",
  "seller_id": "seller_id",
  "rating": 5,
  "comment": "Great work, very professional",
  "quality_rating": 5,
  "communication_rating": 4,
  "timeliness_rating": 5
}
```
**Response:** 201 Created with review object

**Validation:**
- Rating must be 1-5
- Only buyer can review
- Job must be completed

### Get Seller Reviews
```
GET /reviews/seller/:sellerId
```
**Response:**
```json
{
  "count": 12,
  "average_rating": 4.8,
  "reviews": [
    {
      "_id": "review_id",
      "rating": 5,
      "comment": "Great work",
      "buyer_id": { /* user object */ },
      "createdAt": "2024-02-20T00:00:00Z"
    }
  ]
}
```

---

## Analytics

### Market-wide Analytics
```
GET /analytics/market
```
**Response:**
```json
{
  "jobs": {
    "total": 2841,
    "open": 145,
    "closed": 2100,
    "completed": 596
  },
  "savings": {
    "totalBudget": 1234567,
    "totalSpent": 890123,
    "totalSavings": 344444,
    "avgSavingsPercent": 27.89
  }
}
```

### Category Analytics
```
GET /analytics/categories
```
**Response:**
```json
[
  {
    "category": "Design",
    "jobCount": 412,
    "avgBudget": 850.00,
    "avgWinningBid": 620.00,
    "avgSavingsPercent": 27.06
  },
  {
    "category": "Development",
    "jobCount": 687,
    "avgBudget": 2150.00,
    "avgWinningBid": 1480.00,
    "avgSavingsPercent": 31.16
  }
]
```

### Bid Analytics
```
GET /analytics/bids
```
**Response:**
```json
{
  "stats": {
    "avgBidsPerJob": 6.7,
    "maxBids": 23,
    "minBids": 1,
    "totalJobs": 2100
  },
  "distribution": [
    { "_id": "1-3", "count": 542 },
    { "_id": "4-6", "count": 1156 },
    { "_id": "7+", "count": 402 }
  ]
}
```

---

## Payments (Stripe)

### Create Payment Intent
```
POST /payments/create-intent
Authorization: Bearer {token}
```
**Body:**
```json
{
  "job_id": "job_id"
}
```
**Response:**
```json
{
  "clientSecret": "pi_xxxxx_secret_xxxxx"
}
```

### Confirm Payment
```
POST /payments/confirm
Authorization: Bearer {token}
```
**Body:**
```json
{
  "job_id": "job_id",
  "payment_intent_id": "pi_xxxxx"
}
```
**Response:**
```json
{
  "message": "Payment confirmed and funds released",
  "job": { /* updated job */ }
}
```

---

## Error Handling

All errors return consistent format:

```json
{
  "error": "Error message here",
  "details": ["field error 1", "field error 2"] // optional
}
```

**Common Status Codes:**
- `400` - Bad request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (no permission)
- `404` - Not found
- `500` - Server error

---

## Rate Limiting

Plans for future:
- 100 requests per minute per IP
- 1000 requests per day per authenticated user

---

## Webhooks

Stripe webhooks for payment events:
- `payment_intent.succeeded` - Auto-release funds
- `payment_intent.payment_failed` - Send notification

Setup webhook URL in Stripe dashboard → https://your-api.com/api/payments/webhook
