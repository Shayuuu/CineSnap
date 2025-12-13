# 🔐 Environment Variables Setup

## Quick Setup

Create a file named `.env.local` in the `textbookmyseat` folder with the following content:

```env
# =====================================================
# REQUIRED - Database (Supabase)
# =====================================================
# Get from: Supabase Dashboard → Settings → Database → Connection string → URI
# Format: postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres?sslmode=require

# =====================================================
# REQUIRED - NextAuth
# =====================================================
# Generate secret: Run this command: openssl rand -base64 32
NEXTAUTH_SECRET=your-random-secret-key-here-change-in-production
NEXTAUTH_URL=http://localhost:3000

# =====================================================
# REQUIRED - TMDb API
# =====================================================
# Get from: https://www.themoviedb.org/settings/api
TMDB_API_KEY=your-tmdb-api-key-here

# =====================================================
# REQUIRED - Base URL
# =====================================================
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# =====================================================
# OPTIONAL - Redis (Upstash)
# =====================================================
# UPSTASH_REDIS_URL=https://your-redis-url.upstash.io
# UPSTASH_REDIS_TOKEN=your-redis-token

# =====================================================
# OPTIONAL - Stripe Payment
# =====================================================
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_PUBLISHABLE_KEY=pk_test_...
# STRIPE_WEBHOOK_SECRET=whsec_...

# =====================================================
# OPTIONAL - Razorpay Payment
# =====================================================
# RAZORPAY_KEY=rzp_test_...
# RAZORPAY_SECRET=your-razorpay-secret

# =====================================================
# OPTIONAL - Email (SMTP)
# =====================================================
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASSWORD=your-app-password
```

## Step-by-Step Instructions

### 1. Create `.env.local` file

**Windows (PowerShell)**:
```powershell
cd textbookmyseat
New-Item -Path .env.local -ItemType File
```

**Mac/Linux**:
```bash
cd textbookmyseat
touch .env.local
```

### 2. Get Supabase Connection String

1. Go to https://supabase.com
2. Open your project (or create one)
3. Go to **Settings** → **Database**
4. Scroll to **Connection string**
5. Select **URI** tab
6. Copy the connection string
7. Replace `[YOUR-PASSWORD]` with your actual database password
8. Add `?sslmode=require` at the end

**Example**:
```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
```

### 3. Generate NEXTAUTH_SECRET

**Windows (PowerShell)**:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Mac/Linux**:
```bash
openssl rand -base64 32
```

### 4. Get TMDb API Key

1. Go to https://www.themoviedb.org
2. Sign up / Login
3. Go to **Settings** → **API**
4. Request API key (free)
5. Copy your API key

### 5. Fill in `.env.local`

Copy the template above and replace:
- `YOUR_PASSWORD` → Your Supabase database password
- `YOUR_PROJECT_REF` → Your Supabase project reference
- `your-random-secret-key-here` → Generated NEXTAUTH_SECRET
- `your-tmdb-api-key-here` → Your TMDb API key

### 6. Restart Dev Server

After creating `.env.local`, restart your dev server:

```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

## ✅ Verify Setup

Check that your `.env.local` file:
- ✅ Exists in `textbookmyseat` folder
- ✅ Has correct file name (`.env.local` not `.env.local.txt`)
- ✅ Contains `DATABASE_URL` with your Supabase connection string
- ✅ Contains `NEXTAUTH_SECRET` (any random string)
- ✅ Contains `TMDB_API_KEY` (your TMDb key)
- ✅ Contains `NEXTAUTH_URL` and `NEXT_PUBLIC_BASE_URL`

## 🆘 Troubleshooting

### Error: "DATABASE_URL is not set"

**Solution**:
1. Make sure `.env.local` file exists in `textbookmyseat` folder
2. Check file name is exactly `.env.local` (not `.env.local.txt` or `.env`)
3. Restart your dev server after creating the file
4. Verify the file contains `DATABASE_URL=...`

### Error: "Invalid DATABASE_URL format"

**Solution**:
1. Make sure connection string starts with `postgresql://`
2. Include `?sslmode=require` at the end
3. Check password doesn't have unencoded special characters
4. Verify format: `postgresql://user:password@host:port/database?sslmode=require`

### File Not Found

**Windows**: Make sure file is not `.env.local.txt`
- Open File Explorer
- Go to View → Show → File name extensions
- Rename `.env.local.txt` to `.env.local`

## 📝 Notes

- `.env.local` is in `.gitignore` - it won't be committed to Git
- Never commit `.env.local` to version control
- For production (Vercel), add these variables in Vercel dashboard

