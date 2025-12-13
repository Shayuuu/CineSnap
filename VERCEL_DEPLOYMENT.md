# 🚀 Vercel Deployment Guide for CineSnap

Complete step-by-step guide to deploy CineSnap on Vercel.

---

## 📋 Pre-Deployment Checklist

Before deploying, make sure you have:

- [ ] GitHub account
- [ ] Code pushed to GitHub repository
- [ ] MySQL database hosting (PlanetScale, Railway, or AWS RDS)
- [ ] TMDb API key (get from https://www.themoviedb.org/settings/api)
- [ ] Stripe account (optional, for payments)
- [ ] Razorpay account (optional, for payments)

---

## 🗄️ Step 1: Set Up MySQL Database

Vercel doesn't provide MySQL hosting, so you need an external database.

### Option A: PlanetScale (Recommended - Free Tier)

1. **Sign up**: Go to https://planetscale.com
2. **Create Database**:
   - Click "Create database"
   - Name: `cinesnap`
   - Region: Choose closest to you
   - Plan: Free (Hobby)
3. **Get Connection String**:
   - Go to your database → "Connect"
   - Copy the connection string (looks like: `mysql://user:pass@host/database`)
   - **Save this** - you'll need it for Vercel

### Option B: Railway (Includes MySQL)

1. **Sign up**: Go to https://railway.app
2. **Create Project** → "New" → "Database" → "MySQL"
3. **Get Connection String**:
   - Click on MySQL service → "Connect"
   - Copy the connection string

### Option C: AWS RDS / DigitalOcean

- Follow their MySQL setup guides
- Get connection string from their dashboard

---

## 📦 Step 2: Prepare Your Code

### 2.1 Ensure Code is Ready

```bash
# Navigate to your project
cd textbookmyseat

# Make sure all changes are committed
git status

# If not committed:
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2.2 Verify Project Structure

Make sure your project has:
- ✅ `package.json` with build scripts
- ✅ `next.config.js`
- ✅ `.gitignore` (already created)
- ✅ All SQL migration files ready

---

## 🚀 Step 3: Deploy to Vercel

### 3.1 Sign Up / Login

1. Go to **https://vercel.com**
2. Click **"Sign Up"** or **"Login"**
3. Choose **"Continue with GitHub"** (recommended)

### 3.2 Import Your Project

1. Click **"Add New..."** → **"Project"**
2. Find your repository in the list
3. Click **"Import"**

### 3.3 Configure Project Settings

**Project Name**: `cinesnap` (or your preferred name)

**Framework Preset**: 
- Should auto-detect as **Next.js**
- If not, select **Next.js**

**Root Directory**: 
- If your repo is just `textbookmyseat`, leave blank
- If repo contains other folders, set to `textbookmyseat`

**Build and Output Settings**:
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

**Node.js Version**: 
- Select **18.x** or **20.x** (Vercel will auto-detect)

### 3.4 Add Environment Variables

**⚠️ IMPORTANT**: Add these BEFORE clicking "Deploy"

Click **"Environment Variables"** and add:

#### Required Variables:

```env
# Database (use connection string from Step 1)
DATABASE_URL=mysql://user:password@host:port/database

# NextAuth
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=your-secret-key-here

# TMDb API
TMDB_API_KEY=your-tmdb-api-key

# Base URL
NEXT_PUBLIC_BASE_URL=https://your-project.vercel.app
```

#### Optional Variables:

```env
# Redis (Upstash)
UPSTASH_REDIS_URL=https://your-redis.upstash.io
UPSTASH_REDIS_TOKEN=your-token

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Razorpay
RAZORPAY_KEY=rzp_live_...
RAZORPAY_SECRET=your-secret

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

**Generate NEXTAUTH_SECRET**:
```bash
# Run this command locally:
openssl rand -base64 32
```

**Important Notes**:
- Add variables for **Production**, **Preview**, and **Development** environments
- `NEXTAUTH_URL` should match your Vercel domain (update after first deploy)
- Use production API keys (not test keys) for Stripe/Razorpay

### 3.5 Deploy

1. Click **"Deploy"**
2. Wait for build to complete (2-5 minutes)
3. Your app will be live at: `https://your-project.vercel.app`

---

## 🗄️ Step 4: Set Up Database

### 4.1 Run Migrations

Connect to your MySQL database and run these SQL files **in order**:

```sql
-- 1. Main database structure
-- Run: database-setup.sql

-- 2. Reviews table
-- Run: database-reviews.sql

-- 3. Group booking tables
-- Run: database-group-booking.sql
-- Run: database-group-booking-update.sql

-- 4. Wishlist, Loyalty, Food tables
-- Run: database-wishlist-loyalty-food.sql

-- 5. Cancellation & Refunds tables
-- Run: database-cancellation-refunds.sql

-- 6. Stripe migration (if using Stripe)
-- Run: database-stripe-migration.sql
```

**How to run**:
- **PlanetScale**: Use their web console or CLI
- **Railway**: Use MySQL Workbench or CLI
- **AWS RDS**: Use MySQL Workbench or CLI

### 4.2 Insert Sample Data (Optional)

```sql
-- Sample theaters, screens, seats
-- Run: sample-data.sql

-- Sample food items
-- Run: sample-food-items.sql
```

---

## ✅ Step 5: Post-Deployment

### 5.1 Update NEXTAUTH_URL

After first deployment:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update `NEXTAUTH_URL` to your actual Vercel domain:
   ```
   https://your-project.vercel.app
   ```
3. Redeploy (Vercel will auto-redeploy on env var changes)

### 5.2 Configure Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain (e.g., `cinesnap.com`)
3. Follow DNS configuration instructions
4. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_BASE_URL` to match

### 5.3 Set Up Payment Webhooks

#### Stripe Webhook:

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://your-domain.com/api/payment/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
5. Copy webhook secret → Add to Vercel as `STRIPE_WEBHOOK_SECRET`

#### Razorpay Webhook:

1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add webhook URL: `https://your-domain.com/api/payment/webhook`
3. Select events:
   - `payment.captured`
   - `payment.failed`
4. Copy webhook secret → Add to Vercel

### 5.4 Test Your Application

Checklist:

- [ ] Homepage loads correctly
- [ ] Movies page displays movies
- [ ] User registration works
- [ ] User login works
- [ ] Movie detail page loads
- [ ] Seat selection works
- [ ] Booking creation works
- [ ] Payment integration works (if configured)
- [ ] Email notifications work (if configured)

---

## 🔧 Troubleshooting

### Build Fails

**Error**: Build timeout or fails
- **Solution**: Check build logs in Vercel dashboard
- Common causes: Missing dependencies, TypeScript errors, missing env vars

**Error**: Module not found
- **Solution**: Ensure all dependencies are in `package.json`
- Run `npm install` locally to verify

### Database Connection Errors

**Error**: Can't connect to database
- **Solution**: 
  - Verify `DATABASE_URL` is correct
  - Check database allows connections from Vercel IPs
  - For PlanetScale: Enable "Allow connections from anywhere"
  - For Railway: Check firewall settings

**Error**: Access denied
- **Solution**: Verify database credentials are correct

### Authentication Issues

**Error**: NextAuth not working
- **Solution**:
  - Verify `NEXTAUTH_URL` matches your domain exactly
  - Check `NEXTAUTH_SECRET` is set
  - Ensure cookies are enabled in browser

### Environment Variables Not Working

**Error**: Variables not found
- **Solution**:
  - Ensure variables are set for **Production** environment
  - Redeploy after adding variables
  - Check variable names match exactly (case-sensitive)

---

## 📊 Monitoring & Analytics

### Vercel Analytics (Optional)

1. Go to Project Settings → Analytics
2. Enable Vercel Analytics (free tier available)
3. View performance metrics in dashboard

### Error Tracking (Optional)

Consider adding:
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **Vercel Logs**: Built-in logging

---

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to GitHub:

1. Push to `main` branch → Production deployment
2. Push to other branches → Preview deployment
3. Pull requests → Preview deployment

**To disable auto-deploy**:
- Go to Project Settings → Git
- Uncheck "Automatically deploy"

---

## 📝 Quick Reference

### Update Environment Variables

1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add/Edit variables
3. Redeploy (automatic)

### View Logs

1. Go to Vercel Dashboard → Project → Deployments
2. Click on a deployment
3. Click "Functions" tab to see server logs

### Redeploy

- **Automatic**: Push to GitHub
- **Manual**: Go to Deployments → Click "..." → "Redeploy"

---

## 🎉 You're Live!

Your CineSnap app should now be deployed and accessible at:
**https://your-project.vercel.app**

### Next Steps:

1. ✅ Test all features
2. ✅ Set up custom domain (optional)
3. ✅ Configure payment webhooks
4. ✅ Set up monitoring
5. ✅ Share your app! 🎬

---

## 🆘 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Support**: https://vercel.com/support
- **Next.js Docs**: https://nextjs.org/docs
- **Community**: https://github.com/vercel/next.js/discussions

---

**Happy Deploying! 🚀**

