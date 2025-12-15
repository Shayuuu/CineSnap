# 🔧 Fix TMDb API "fetch failed" Error

## Error Message
```
fetch failed
at MovieDetailPage (app\movies\[id]\page.tsx:49:24)
```

## Common Causes

### 1. Missing TMDB_API_KEY ✅ (Most Common)

**Solution**: Add your TMDb API key to `.env.local`

1. **Get your API key**:
   - Go to: https://www.themoviedb.org/settings/api
   - Login or create an account
   - Click "Create" under "API" section
   - Fill in the form (use "Developer" type)
   - Copy your API key

2. **Add to `.env.local`**:
   ```env
   TMDB_API_KEY=your-actual-api-key-here
   ```

3. **Restart dev server**:
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

---

### 2. Invalid API Key

**Symptoms**: Error 401 (Unauthorized)

**Solution**:
- Verify your API key is correct
- Make sure there are no extra spaces or quotes
- Get a new API key if needed

---

### 3. Network Issues

**Symptoms**: Connection timeout or ENOTFOUND error

**Solution**:
- Check your internet connection
- Try accessing https://api.themoviedb.org in your browser
- Check if firewall is blocking requests

---

### 4. API Rate Limit

**Symptoms**: Error 429 (Too Many Requests)

**Solution**:
- Wait a few minutes
- TMDb has rate limits for free API keys
- Consider upgrading to a paid plan if needed

---

## ✅ Quick Fix Checklist

- [ ] `.env.local` file exists in `textbookmyseat` folder
- [ ] `TMDB_API_KEY=your-key` is in `.env.local`
- [ ] No quotes around the API key value
- [ ] No extra spaces before/after the key
- [ ] Dev server restarted after adding key
- [ ] API key is valid (test at https://www.themoviedb.org/settings/api)

---

## 📝 Complete `.env.local` Template

```env
# =====================================================
# REQUIRED - TMDb API
# =====================================================
# Get from: https://www.themoviedb.org/settings/api
TMDB_API_KEY=your-tmdb-api-key-here

# =====================================================
# REQUIRED - Supabase Database
# =====================================================
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.giphqdjlnjbmrsspaspc.supabase.co:5432/postgres?sslmode=require

# =====================================================
# REQUIRED - NextAuth
# =====================================================
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=http://localhost:3000

# =====================================================
# REQUIRED - Base URL
# =====================================================
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## 🧪 Test Your API Key

You can test your API key by running:

```bash
curl "https://api.themoviedb.org/3/movie/550?api_key=YOUR_API_KEY"
```

Replace `YOUR_API_KEY` with your actual key. You should get JSON data back.

---

## 🆘 Still Not Working?

1. **Check console logs** - Look for specific error messages
2. **Verify `.env.local` location** - Must be in `textbookmyseat` folder
3. **Check for typos** - Variable name must be exactly `TMDB_API_KEY`
4. **Restart dev server** - Environment variables only load on startup
5. **Check Next.js version** - Should be 16.0.8 or higher

---

## 📖 Get TMDb API Key

1. Visit: https://www.themoviedb.org/settings/api
2. Login or sign up
3. Click "Create" under API section
4. Fill form:
   - **Type**: Developer
   - **Application name**: CineSnap (or any name)
   - **Application URL**: http://localhost:3000
   - **Application summary**: Movie ticket booking app
5. Accept terms and click "Submit"
6. Copy your API key immediately

---

**Need help?** Check the console logs for specific error messages!


