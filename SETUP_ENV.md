# ⚠️ DATABASE_URL Not Set - Quick Fix

## The Error
```
DATABASE_URL is not set. Please set your Supabase connection string.
```

## ✅ Solution: Create `.env.local` File

### Step 1: Create the File

**Option A: Using PowerShell** (in `textbookmyseat` folder):
```powershell
@"
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
NEXTAUTH_SECRET=change-this-to-random-secret
NEXTAUTH_URL=http://localhost:3000
TMDB_API_KEY=your-tmdb-api-key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
"@ | Out-File -FilePath .env.local -Encoding utf8
```

**Option B: Manually**:
1. Open `textbookmyseat` folder in File Explorer
2. Create a new file named `.env.local` (make sure it's not `.env.local.txt`)
3. Copy and paste the content below

### Step 2: Get Your Supabase Connection String

1. Go to https://supabase.com
2. Open your project
3. Go to **Settings** → **Database**
4. Scroll to **Connection string**
5. Click **URI** tab
6. Copy the connection string
7. Replace `[YOUR-PASSWORD]` with your database password
8. Add `?sslmode=require` at the end if not present

**Example**:
```
postgresql://postgres.xxxxx:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
```

### Step 3: Fill in `.env.local`

Create `.env.local` file with this content (replace the values):

```env
# Database (Supabase)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require

# NextAuth (generate secret: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=http://localhost:3000

# TMDb API (get from https://www.themoviedb.org/settings/api)
TMDB_API_KEY=your-tmdb-api-key

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Step 4: Restart Dev Server

After creating `.env.local`:
1. Stop your dev server (Ctrl+C)
2. Restart: `npm run dev`

## 🔍 Verify File Created

**Check if file exists**:
```powershell
cd C:\Users\Rutaab\Desktop\Personal\CineSnap\textbookmyseat
Test-Path .env.local
```

Should return `True`

## 📝 Important Notes

- File must be named exactly `.env.local` (not `.env.local.txt`)
- File must be in the `textbookmyseat` folder (same folder as `package.json`)
- Restart dev server after creating/editing the file
- Never commit `.env.local` to Git (it's already in `.gitignore`)

## 🆘 Still Having Issues?

1. **File name wrong?**
   - Windows might hide file extensions
   - Go to View → Show → File name extensions
   - Make sure it's `.env.local` not `.env.local.txt`

2. **File location wrong?**
   - File must be in: `textbookmyseat/.env.local`
   - Same folder as `package.json`

3. **Connection string format?**
   - Must start with `postgresql://`
   - Must include `?sslmode=require` at the end
   - Password should be URL-encoded if it has special characters


