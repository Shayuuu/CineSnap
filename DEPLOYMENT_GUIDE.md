# 🚀 CineSnap Deployment Guide

This guide will help you deploy your CineSnap movie booking application to production.

## 📋 Table of Contents
1. [Recommended Platforms](#recommended-platforms)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Environment Variables](#environment-variables)
4. [Database Setup](#database-setup)
5. [Deployment Steps](#deployment-steps)
6. [Post-Deployment](#post-deployment)

---

## 🎯 Recommended Platforms

### **Option 1: Vercel (Recommended for Next.js)**
- ✅ **Best for Next.js** - Made by the creators of Next.js
- ✅ **Free tier** available
- ✅ **Automatic deployments** from GitHub
- ✅ **Built-in CDN** and edge functions
- ✅ **Easy environment variable management**
- ⚠️ **Database**: Use external MySQL hosting (PlanetScale, Railway, or AWS RDS)

**Website**: https://vercel.com

### **Option 2: Railway**
- ✅ **Full-stack hosting** (app + database)
- ✅ **MySQL included**
- ✅ **Simple deployment**
- ✅ **Free tier** available
- ✅ **One-click deployments**

**Website**: https://railway.app

### **Option 3: Render**
- ✅ **Free tier** available
- ✅ **MySQL database** option
- ✅ **Auto-deploy from GitHub**
- ⚠️ **Free tier** spins down after inactivity

**Website**: https://render.com

### **Option 4: AWS / DigitalOcean / Heroku**
- ✅ **More control**
- ✅ **Scalable**
- ⚠️ **More complex setup**
- ⚠️ **Paid options**

---

## ✅ Pre-Deployment Checklist

- [ ] All code is committed to Git
- [ ] Database migrations are ready
- [ ] Environment variables documented
- [ ] API keys obtained (TMDb, Stripe, Razorpay, etc.)
- [ ] Database hosting set up
- [ ] Domain name ready (optional)

---

## 🔐 Environment Variables

Create a `.env.local` file (for local) and set these in your hosting platform:

### **Required Variables**

```env
# Database (MySQL)
DATABASE_URL=mysql://user:password@host:port/database
# OR use individual variables:
DB_HOST=your-db-host
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=bookmyseat

# NextAuth
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-random-secret-key-here

# TMDb API
TMDB_API_KEY=your-tmdb-api-key

# Base URL
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### **Optional Variables**

```env
# Redis (Upstash) - Optional, app works without it
UPSTASH_REDIS_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_TOKEN=your-redis-token

# Stripe Payment - Optional
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Razorpay Payment - Optional
RAZORPAY_KEY=rzp_live_...
RAZORPAY_SECRET=your-razorpay-secret

# Email (SMTP) - Optional
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### **Generate NEXTAUTH_SECRET**
Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

---

## 🗄️ Database Setup

### **Step 1: Choose Database Hosting**

**Option A: PlanetScale (Recommended)**
- Free tier available
- MySQL compatible
- Easy setup
- Website: https://planetscale.com

**Option B: Railway**
- Includes MySQL
- Simple setup
- Website: https://railway.app

**Option C: AWS RDS / DigitalOcean**
- More control
- Scalable
- Paid options

### **Step 2: Run Database Migrations**

1. Connect to your MySQL database
2. Run these SQL files in order:
   ```sql
   -- 1. Main database setup
   database-setup.sql
   
   -- 2. Reviews
   database-reviews.sql
   
   -- 3. Group booking
   database-group-booking.sql
   database-group-booking-update.sql
   
   -- 4. Wishlist, Loyalty, Food
   database-wishlist-loyalty-food.sql
   
   -- 5. Cancellation & Refunds
   database-cancellation-refunds.sql
   
   -- 6. Stripe migration (if using Stripe)
   database-stripe-migration.sql
   ```

3. Insert sample data (optional):
   ```sql
   -- Sample theaters, screens, seats
   sample-data.sql
   
   -- Sample food items
   sample-food-items.sql
   ```

---

## 🚀 Deployment Steps

### **Deploying to Vercel (Recommended)**

#### **Step 1: Prepare Your Code**
```bash
# Make sure you're in the project directory
cd textbookmyseat

# Create .gitignore if it doesn't exist
cat > .gitignore << EOF
# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env

# Vercel
.vercel

# Typescript
*.tsbuildinfo
next-env.d.ts
EOF

# Commit your code
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### **Step 2: Deploy to Vercel**

1. **Sign up/Login**: Go to https://vercel.com and sign up with GitHub

2. **Import Project**:
   - Click "Add New Project"
   - Import your GitHub repository
   - Select the `textbookmyseat` folder (if repo is in parent directory)

3. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `textbookmyseat` (if needed)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Add Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add all required variables from the [Environment Variables](#environment-variables) section
   - Make sure to add them for **Production**, **Preview**, and **Development**

5. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-project.vercel.app`

#### **Step 3: Configure Custom Domain (Optional)**
- Go to Project Settings → Domains
- Add your custom domain
- Follow DNS configuration instructions

---

### **Deploying to Railway**

#### **Step 1: Sign Up**
- Go to https://railway.app
- Sign up with GitHub

#### **Step 2: Create New Project**
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose your repository

#### **Step 3: Add MySQL Database**
- Click "New" → "Database" → "MySQL"
- Railway will create a MySQL database
- Copy the connection string

#### **Step 4: Configure Environment Variables**
- Go to your project → Variables
- Add all environment variables
- Use the MySQL connection string from Step 3

#### **Step 5: Deploy**
- Railway will auto-deploy
- Your app will be live at `https://your-project.up.railway.app`

---

### **Deploying to Render**

#### **Step 1: Sign Up**
- Go to https://render.com
- Sign up with GitHub

#### **Step 2: Create Web Service**
- Click "New" → "Web Service"
- Connect your GitHub repository
- Select the `textbookmyseat` directory

#### **Step 3: Configure**
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Environment**: Node

#### **Step 4: Add Database**
- Click "New" → "PostgreSQL" (or use external MySQL)
- Copy connection details

#### **Step 5: Add Environment Variables**
- Go to Environment section
- Add all required variables

#### **Step 6: Deploy**
- Click "Create Web Service"
- Render will deploy your app

---

## 🔧 Post-Deployment

### **1. Test Your Application**
- [ ] Homepage loads
- [ ] Movies page works
- [ ] User registration/login works
- [ ] Booking flow works
- [ ] Payment integration works
- [ ] Email notifications work

### **2. Configure Webhooks**

**Stripe Webhook**:
- Go to Stripe Dashboard → Webhooks
- Add endpoint: `https://your-domain.com/api/payment/stripe/webhook`
- Select events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`
- Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

**Razorpay Webhook**:
- Go to Razorpay Dashboard → Webhooks
- Add endpoint: `https://your-domain.com/api/payment/webhook`
- Select events: `payment.captured`, `payment.failed`
- Copy webhook secret

### **3. Set Up Monitoring**
- Enable Vercel Analytics (if using Vercel)
- Set up error tracking (Sentry, LogRocket)
- Monitor database performance

### **4. Optimize Performance**
- Enable Next.js Image Optimization
- Set up CDN caching
- Optimize database queries

---

## 📝 Important Notes

1. **Database**: Make sure your database is accessible from your hosting platform (whitelist IPs if needed)

2. **Environment Variables**: Never commit `.env.local` to Git. Always use your hosting platform's environment variable settings.

3. **API Keys**: Use production keys (not test keys) for:
   - Stripe (`sk_live_...` not `sk_test_...`)
   - Razorpay (`rzp_live_...` not `rzp_test_...`)

4. **NEXTAUTH_URL**: Must match your production domain exactly (including `https://`)

5. **Build Errors**: Check build logs if deployment fails. Common issues:
   - Missing environment variables
   - Database connection issues
   - TypeScript errors

---

## 🆘 Troubleshooting

### **Build Fails**
- Check build logs in your hosting platform
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### **Database Connection Errors**
- Check database credentials
- Verify database is accessible from hosting platform
- Check firewall/security group settings

### **Environment Variables Not Working**
- Ensure variables are set for the correct environment (Production)
- Restart deployment after adding variables
- Check variable names match exactly (case-sensitive)

### **Payment Webhooks Not Working**
- Verify webhook URL is correct
- Check webhook secret matches
- Test webhook in Stripe/Razorpay dashboard

---

## 🎉 You're Done!

Your CineSnap application should now be live! Share your deployment URL and start booking movies! 🎬

For support, check:
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- Next.js Docs: https://nextjs.org/docs

