# 🚀 Your Supabase Setup - Quick Guide

## Your Project Details
- **Project URL**: https://giphqdjlnjbmrsspaspc.supabase.co
- **Project Reference**: `giphqdjlnjbmrsspaspc`
- **Dashboard**: https://supabase.com/dashboard/project/giphqdjlnjbmrsspaspc

---

## ⚡ Quick Setup (3 Steps)

### Step 1: Get Your Database Password

1. Go to: https://supabase.com/dashboard/project/giphqdjlnjbmrsspaspc/settings/database
2. Scroll to **"Database password"** section
3. If you don't remember it, click **"Reset database password"**
4. **Copy the password** (you'll need it!)

### Step 2: Add to `.env.local`

Open your `.env.local` file and add this line (replace `YOUR_PASSWORD` with your actual password):

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.giphqdjlnjbmrsspaspc.supabase.co:5432/postgres?sslmode=require
```

**Example** (if password is `MyPassword123!`):
```env
DATABASE_URL=postgresql://postgres:MyPassword123!@db.giphqdjlnjbmrsspaspc.supabase.co:5432/postgres?sslmode=require
```

### Step 3: Run Database Setup

1. Go to: https://supabase.com/dashboard/project/giphqdjlnjbmrsspaspc/sql/new
2. Open `supabase-complete-setup.sql` file
3. Copy entire file content
4. Paste into Supabase SQL Editor
5. Click **"Run"** (or press Ctrl+Enter)

---

## 📝 Complete `.env.local` Template

Your `.env.local` should have:

```env
# =====================================================
# REQUIRED - Supabase Database
# =====================================================
# Replace YOUR_PASSWORD with your actual database password
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.giphqdjlnjbmrsspaspc.supabase.co:5432/postgres?sslmode=require

# =====================================================
# REQUIRED - NextAuth
# =====================================================
# Generate secret: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=http://localhost:3000

# =====================================================
# REQUIRED - TMDb API
# =====================================================
# Get from: https://www.themoviedb.org/settings/api
TMDB_API_KEY=your-tmdb-api-key

# =====================================================
# REQUIRED - Base URL
# =====================================================
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## 🔗 Direct Links

- **Dashboard**: https://supabase.com/dashboard/project/giphqdjlnjbmrsspaspc
- **SQL Editor**: https://supabase.com/dashboard/project/giphqdjlnjbmrsspaspc/sql/new
- **Database Settings**: https://supabase.com/dashboard/project/giphqdjlnjbmrsspaspc/settings/database
- **Table Editor**: https://supabase.com/dashboard/project/giphqdjlnjbmrsspaspc/editor

---

## ✅ Checklist

- [ ] Got database password from Supabase
- [ ] Added `DATABASE_URL` to `.env.local`
- [ ] Ran `supabase-complete-setup.sql` in SQL Editor
- [ ] Restarted dev server (`npm run dev`)
- [ ] App loads without errors

---

## 🆘 Troubleshooting

### "DATABASE_URL is not set"
- ✅ Make sure `.env.local` exists in `textbookmyseat` folder
- ✅ Check `DATABASE_URL` line is present
- ✅ Restart dev server after adding

### "Invalid DATABASE_URL format"
- ✅ Check connection string starts with `postgresql://`
- ✅ Make sure password doesn't have unencoded special characters
- ✅ Include `?sslmode=require` at the end

### "Connection refused" or "SSL required"
- ✅ Make sure `?sslmode=require` is at the end of connection string
- ✅ Verify Supabase project is active

---

## 🎯 Next Steps After Setup

1. ✅ Test app locally
2. ✅ Deploy to Vercel (see `VERCEL_DEPLOYMENT.md`)
3. ✅ Add environment variables in Vercel dashboard
4. ✅ Test production deployment

---

**Ready to go!** 🚀


