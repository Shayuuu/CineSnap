# Deployment Guide: Vercel + Neon PostgreSQL + Upstash Redis

This guide will help you deploy CineSnap to Vercel with Neon PostgreSQL and Upstash Redis.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Neon Account**: Sign up at [neon.tech](https://neon.tech)
3. **Upstash Account**: Sign up at [upstash.com](https://upstash.com)
4. **TMDb API Key**: Get from [themoviedb.org](https://www.themoviedb.org/settings/api)

## Step 1: Set Up Neon PostgreSQL

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project
3. Copy the connection string (it looks like: `postgresql://user:password@host/database?sslmode=require`)
4. Run the schema file:
   - Go to SQL Editor in Neon dashboard
   - Copy and paste contents of `neon-schema.sql`
   - Execute the script

## Step 2: Set Up Upstash Redis

1. Go to [Upstash Console](https://console.upstash.com)
2. Create a new Redis database
3. Copy the `UPSTASH_REDIS_URL` and `UPSTASH_REDIS_TOKEN`
4. Note: Redis is optional for development but recommended for production

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add UPSTASH_REDIS_URL
vercel env add UPSTASH_REDIS_TOKEN
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add TMDB_API_KEY
```

### Option B: Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure environment variables (see below)

## Step 4: Environment Variables

Add these environment variables in Vercel Dashboard → Project → Settings → Environment Variables:

### Required Variables

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-app.vercel.app

# TMDb API
TMDB_API_KEY=your-tmdb-api-key

# Redis (Upstash) - Optional but recommended
UPSTASH_REDIS_URL=https://your-redis.upstash.io
UPSTASH_REDIS_TOKEN=your-redis-token
```

### Optional Variables

```env
# Base URL
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app

# Stripe (for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Razorpay (for payments)
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your-razorpay-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
```

## Step 5: Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

Copy the output and use it as your `NEXTAUTH_SECRET`.

## Step 6: Verify Deployment

1. After deployment, visit your Vercel URL
2. Check the logs in Vercel Dashboard → Deployments → [Your Deployment] → Logs
3. Verify database connection in Neon dashboard
4. Test Redis connection (optional)

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check Neon dashboard for connection string
- Ensure SSL mode is set to `require`
- Check Neon project is active (not paused)

### Redis Connection Issues

- Verify `UPSTASH_REDIS_URL` and `UPSTASH_REDIS_TOKEN` are correct
- Redis is optional - app will work without it (seat locking won't work)

### Build Errors

- Check Node.js version (should be 18+)
- Verify all environment variables are set
- Check build logs in Vercel dashboard

## Post-Deployment

1. **Seed Data**: Run sample data scripts if needed
2. **Test Booking Flow**: Create a test booking
3. **Monitor Logs**: Check Vercel logs for errors
4. **Set Up Custom Domain**: Add custom domain in Vercel settings

## Support

- Vercel Docs: https://vercel.com/docs
- Neon Docs: https://neon.tech/docs
- Upstash Docs: https://docs.upstash.com

