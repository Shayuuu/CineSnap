# 🔧 Update Your .env.local File

## Current Issue

Your `.env.local` file has **MySQL variables** but is missing the **Supabase PostgreSQL `DATABASE_URL`**.

## ✅ Quick Fix

**Add this line to your `.env.local` file** (replace `YOUR_PASSWORD` with your actual Supabase database password):

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.giphqdjlnjbmrsspaspc.supabase.co:5432/postgres?sslmode=require
```

---

## 📝 Complete Updated .env.local

Replace your entire `.env.local` file with this (update the values marked with `YOUR_*`):

```env
# =====================================================
# REQUIRED - Supabase Database (PostgreSQL)
# =====================================================
# Get password from: https://supabase.com/dashboard/project/giphqdjlnjbmrsspaspc/settings/database
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.giphqdjlnjbmrsspaspc.supabase.co:5432/postgres?sslmode=require

# =====================================================
# REQUIRED - NextAuth
# =====================================================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-this-in-production

# =====================================================
# REQUIRED - TMDb API
# =====================================================
TMDB_API_KEY=c45a857c193f6302f2b5061c3b85e743

# =====================================================
# REQUIRED - Base URL
# =====================================================
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# =====================================================
# OPTIONAL - Email (for notifications)
# =====================================================
EMAIL_SERVER=smtp://username:password@smtp.example.com:587
EMAIL_FROM=noreply@bookmyseat.com

# =====================================================
# OPTIONAL - Payment (Razorpay/Stripe)
# =====================================================
RAZORPAY_KEY=your_razorpay_key_id
RAZORPAY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

# =====================================================
# OPTIONAL - Redis (for seat locking)
# =====================================================
UPSTASH_REDIS_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_TOKEN=your-redis-token

# =====================================================
# OLD MySQL Variables (IGNORED - Can be removed)
# =====================================================
# These are no longer used - you can delete them:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=root
# DB_NAME=bookmyseat
# DB_PORT=3306
```

---

## 🔑 Get Your Supabase Password

1. Go to: https://supabase.com/dashboard/project/giphqdjlnjbmrsspaspc/settings/database
2. Scroll to **"Database password"** section
3. If you don't remember it, click **"Reset database password"**
4. **Copy the password immediately** (you won't see it again!)

---

## ⚠️ Important: URL Encode Special Characters

If your password contains special characters (`@`, `#`, `%`, `&`, etc.), you need to URL encode them:

**Example**: If password is `My@Pass#123`
- Encoded: `My%40Pass%23123`
- Use in connection string: `postgresql://postgres:My%40Pass%23123@db.giphqdjlnjbmrsspaspc.supabase.co:5432/postgres?sslmode=require`

**URL Encode Tool**: https://www.urlencoder.org/

---

## 📍 File Location

Your `.env.local` file should be at:
```
C:\Users\Rutaab\Desktop\Personal\CineSnap\textbookmyseat\.env.local
```

---

## ✅ After Updating

1. **Save** the `.env.local` file
2. **Restart** your dev server:
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```
3. **Check** console for connection success message

---

## 🆘 Still Getting Errors?

See `FIX_DATABASE_CONNECTION.md` for detailed troubleshooting.


