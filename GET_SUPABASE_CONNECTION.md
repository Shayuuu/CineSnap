# 🔗 Get Your Supabase Connection String

## Your Supabase Project
**Project URL**: https://giphqdjlnjbmrsspaspc.supabase.co

## Step-by-Step Instructions

### Step 1: Access Your Supabase Project

1. Go to: https://supabase.com/dashboard
2. Login to your account
3. Find your project (or it should be visible if you're already logged in)

### Step 2: Get Database Connection String

1. **Click on your project** (or go directly to: https://supabase.com/dashboard/project/giphqdjlnjbmrsspaspc)
2. In the left sidebar, click **"Settings"** (gear icon)
3. Click **"Database"** in the settings menu
4. Scroll down to **"Connection string"** section
5. Click on the **"URI"** tab
6. You'll see a connection string like:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```

### Step 3: Get Your Database Password

If you don't remember your database password:

1. In Supabase Dashboard → **Settings** → **Database**
2. Look for **"Database password"** section
3. If you forgot it, click **"Reset database password"**
4. **Save the new password** (you'll need it!)

### Step 4: Build Your Connection String

Your connection string format should be:

```
postgresql://postgres:[YOUR-PASSWORD]@db.giphqdjlnjbmrsspaspc.supabase.co:5432/postgres?sslmode=require
```

**OR** (if using connection pooler):

```
postgresql://postgres.giphqdjlnjbmrsspaspc:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
```

**Replace**:
- `[YOUR-PASSWORD]` → Your actual database password

### Step 5: Add to `.env.local`

Open your `.env.local` file and add/update:

```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.giphqdjlnjbmrsspaspc.supabase.co:5432/postgres?sslmode=require
```

**Example** (if your password is `mypassword123`):
```env
DATABASE_URL=postgresql://postgres:mypassword123@db.giphqdjlnjbmrsspaspc.supabase.co:5432/postgres?sslmode=require
```

### Step 6: Restart Dev Server

After updating `.env.local`:
1. Stop server: `Ctrl+C`
2. Start again: `npm run dev`

## ✅ Quick Copy-Paste Template

Add this to your `.env.local` (replace `YOUR_PASSWORD`):

```env
# Supabase Database
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.giphqdjlnjbmrsspaspc.supabase.co:5432/postgres?sslmode=require

# NextAuth
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# TMDb API
TMDB_API_KEY=your-tmdb-api-key

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 🔍 Alternative: Use Connection Pooler (Recommended for Production)

For better performance, use the connection pooler:

1. In Supabase Dashboard → **Settings** → **Database**
2. Scroll to **"Connection pooling"**
3. Copy the **"Connection string"** from there
4. Format: `postgresql://postgres.giphqdjlnjbmrsspaspc:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require`

## 🆘 Can't Find Password?

1. Go to Supabase Dashboard → Settings → Database
2. Click **"Reset database password"**
3. Copy the new password immediately
4. Update your `.env.local` with the new password

## 📝 Next Steps

After setting up `DATABASE_URL`:

1. ✅ Run `supabase-complete-setup.sql` in Supabase SQL Editor
2. ✅ Restart your dev server
3. ✅ Test your app

---

**Your Supabase Project**: https://giphqdjlnjbmrsspaspc.supabase.co
**Dashboard**: https://supabase.com/dashboard/project/giphqdjlnjbmrsspaspc

