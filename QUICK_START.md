# Quick Start Guide - Neon PostgreSQL Setup

Your Neon database is already connected! Here's what to do next:

## ✅ Current Status

- ✅ Database connection: **Connected**
- ✅ Tables created: **15 tables**
- ⚠️  Sample data: **Not seeded yet**

## 🚀 Next Steps

### 1. Seed Sample Data (Optional but Recommended)

Run this to create sample theaters, screens, and seats:

```bash
npm run seed-db
```

This will create:
- 5 theaters (PVR, INOX, Cinepolis in Mumbai, Delhi, Bangalore)
- 15 screens (3 per theater)
- ~1,500 seats (VIP, Premium, Standard)
- 6 food items

### 2. Test Database Connection

```bash
npm run test-db
```

### 3. Start Development Server

```bash
npm run dev
```

## 📝 Environment Variables

Your `.env.local` file should contain:

```env
DATABASE_URL=postgresql://neondb_owner:npg_rWQJG46OfCdw@ep-weathered-poetry-ad2sytyw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

## 🔧 Additional Setup

### Add Other Environment Variables

Create or update `.env.local` with:

```env
# Database (already set)
DATABASE_URL=postgresql://neondb_owner:npg_rWQJG46OfCdw@ep-weathered-poetry-ad2sytyw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

# NextAuth (required)
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# TMDb API (required)
TMDB_API_KEY=your-tmdb-api-key

# Redis Upstash (optional)
UPSTASH_REDIS_URL=https://your-redis.upstash.io
UPSTASH_REDIS_TOKEN=your-redis-token
```

### Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

## 🎬 Ready to Deploy?

1. **Seed the database**: `npm run seed-db`
2. **Test locally**: `npm run dev`
3. **Deploy to Vercel**: Follow `DEPLOYMENT.md`

## 📚 Database Schema

All tables are created. View schema in `neon-schema.sql`

## 🆘 Troubleshooting

- **Connection issues**: Check `DATABASE_URL` in `.env.local`
- **No data**: Run `npm run seed-db`
- **Tables missing**: Run `npm run setup-db`
