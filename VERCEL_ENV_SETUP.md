# Vercel Environment Variables Setup

Copy these environment variables to your Vercel project settings:

## Required Variables

```env
# Neon PostgreSQL Database
DATABASE_URL=postgresql://user:password@host.neon.tech/database?sslmode=require

# NextAuth Configuration
NEXTAUTH_SECRET=your-generated-secret-here
NEXTAUTH_URL=https://your-app.vercel.app

# TMDb API
TMDB_API_KEY=your-tmdb-api-key

# Upstash Redis (Optional but recommended)
UPSTASH_REDIS_URL=https://your-redis.upstash.io
UPSTASH_REDIS_TOKEN=your-redis-token
```

## Optional Variables

```env
# Base URL
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app

# Stripe Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Razorpay Payments
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your-razorpay-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
```

## How to Get Values

### 1. DATABASE_URL (Neon)
1. Go to https://console.neon.tech
2. Create a new project
3. Copy the connection string from the dashboard
4. Format: `postgresql://user:password@host.neon.tech/database?sslmode=require`

### 2. NEXTAUTH_SECRET
Generate using:
```bash
openssl rand -base64 32
```

### 3. NEXTAUTH_URL
Use your Vercel deployment URL:
```
https://your-app-name.vercel.app
```

### 4. TMDB_API_KEY
1. Go to https://www.themoviedb.org/settings/api
2. Request an API key
3. Copy the key

### 5. UPSTASH_REDIS_URL & UPSTASH_REDIS_TOKEN
1. Go to https://console.upstash.com
2. Create a new Redis database
3. Copy the REST URL and Token

## Setting in Vercel

1. Go to your Vercel project dashboard
2. Click on **Settings** → **Environment Variables**
3. Add each variable above
4. Select environments: **Production**, **Preview**, **Development**
5. Click **Save**
6. Redeploy your application

## Verify Setup

After deployment, check:
1. Vercel logs for database connection success
2. Neon dashboard for active connections
3. Application loads without errors

