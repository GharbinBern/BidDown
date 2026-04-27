# Quick Start

**Backend** (port 5001)
```bash
cd server && npm install
cp .env.example .env  # fill in MONGODB_URI and JWT_SECRET
npm run dev
```

**Frontend** (port 3001)
```bash
cd client && npm install
cp .env.example .env  # set VITE_API_URL=http://localhost:5001
npm run dev
```

**Seed data**
```bash
cd server && npm run seed
```

See API.md for endpoints, SETUP.md for deployment.
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

