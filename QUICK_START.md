# 🚀 Quick Start Guide - CineSnap

Get your app running in 5 minutes!

---

## 📋 Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- TMDb API key (free)

---

## ⚡ Quick Setup

### Step 1: Install Dependencies

```bash
cd textbookmyseat
npm install
```

### Step 2: Set Up Environment Variables

1. **Copy the example file**:
   ```bash
   cp .env.example .env.local
   ```

2. **Edit `.env.local`** and add your values:

   **Required**:
   ```env
   # Get from Supabase Dashboard → Settings → Database → Connection string → URI
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
   
   # Generate with: openssl rand -base64 32
   NEXTAUTH_SECRET=your-random-secret-key-here
   
   NEXTAUTH_URL=http://localhost:3000
   
   # Get from: https://www.themoviedb.org/settings/api
   TMDB_API_KEY=your-tmdb-api-key
   
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

### Step 3: Set Up Supabase Database

1. **Create Supabase Project**:
   - Go to https://supabase.com
   - Create new project
   - Wait for setup (1-2 minutes)

2. **Get Connection String**:
   - Go to Settings → Database
   - Copy the "URI" connection string
   - Replace `[YOUR-PASSWORD]` with your database password
   - Add `?sslmode=require` at the end

3. **Run Database Setup**:
   - Go to SQL Editor in Supabase
   - Open `supabase-complete-setup.sql`
   - Copy entire file
   - Paste into SQL Editor
   - Click "Run"

### Step 4: Run the App

```bash
npm run dev
```

Visit: http://localhost:3000

---

## ✅ Verify Setup

1. **Homepage loads** ✅
2. **Movies page shows movies** ✅
3. **Can create account** ✅
4. **Can login** ✅

---

## 🆘 Troubleshooting

### "DATABASE_URL is not set"
- Make sure `.env.local` exists
- Check file name is exactly `.env.local` (not `.env.local.txt`)
- Restart your dev server after creating `.env.local`

### "Invalid DATABASE_URL format"
- Make sure connection string starts with `postgresql://`
- Include `?sslmode=require` at the end
- Check password doesn't have special characters (URL encode if needed)

### Database connection errors
- Verify Supabase project is active
- Check connection string is correct
- Make sure database password is correct

---

## 📚 Next Steps

- Deploy to Vercel: See `VERCEL_DEPLOYMENT.md`
- Set up payments: Add Stripe/Razorpay keys
- Configure email: Add SMTP credentials

---

**Need help?** Check the detailed guides:
- `SUPABASE_SETUP.md` - Complete Supabase setup
- `VERCEL_DEPLOYMENT.md` - Deployment guide


