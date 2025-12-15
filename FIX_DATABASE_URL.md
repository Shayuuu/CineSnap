# 🔧 Fix: DATABASE_URL Not Set

## The Problem
Your `.env.local` file exists but `DATABASE_URL` is missing or not set correctly.

## ✅ Quick Fix

### Step 1: Open `.env.local`

The file is located at:
```
C:\Users\Rutaab\Desktop\Personal\CineSnap\textbookmyseat\.env.local
```

### Step 2: Add DATABASE_URL

Make sure your `.env.local` file contains this line:

```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
```

### Step 3: Get Your Supabase Connection String

1. **Go to Supabase**: https://supabase.com
2. **Open your project**
3. **Settings** → **Database**
4. **Connection string** section
5. **URI** tab
6. **Copy the connection string**

**Example format**:
```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Important**: 
- Replace `[YOUR-PASSWORD]` with your actual database password
- Add `?sslmode=require` at the end if not present

### Step 4: Complete `.env.local` Template

Your `.env.local` should look like this:

```env
# Database (Supabase) - REQUIRED
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres?sslmode=require

# NextAuth - REQUIRED
NEXTAUTH_SECRET=generate-random-secret-here
NEXTAUTH_URL=http://localhost:3000

# TMDb API - REQUIRED
TMDB_API_KEY=your-tmdb-api-key

# Base URL - REQUIRED
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Step 5: Restart Dev Server

**IMPORTANT**: After editing `.env.local`, you MUST restart your dev server:

1. Stop the server: Press `Ctrl+C` in the terminal
2. Start again: `npm run dev`

## 🔍 Verify It's Working

After restarting, you should NOT see the error anymore.

If you still see the error:
1. Check `.env.local` file exists
2. Check `DATABASE_URL` line is present
3. Check no extra spaces around `=`
4. Check connection string format is correct
5. Restart dev server again

## 📝 Generate NEXTAUTH_SECRET

If you need to generate a secret:

**PowerShell**:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Or use online**: https://generate-secret.vercel.app/32

## 🆘 Still Not Working?

1. **Check file location**: Must be in `textbookmyseat` folder
2. **Check file name**: Must be exactly `.env.local` (not `.env.local.txt`)
3. **Check format**: No quotes around values, no trailing spaces
4. **Restart**: Always restart dev server after changes


