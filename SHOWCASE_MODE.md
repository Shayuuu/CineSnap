# 🎭 Showcase Mode - Deploy Without Database!

Perfect for **portfolio/showcase projects** - No database setup needed!

## ✅ What's Included

- ✅ **Movies fetched from TMDb API** (hardcoded API key in code)
- ✅ 2 Theaters (PVR Cinemas, INOX) in Mumbai
- ✅ Multiple screens with seats
- ✅ Showtimes for movies
- ✅ Demo user account
- ✅ All features work (booking, seat selection, etc.)
- ✅ **No environment variables needed!**

## 🚀 Quick Deploy to Vercel

### Step 1: Update TMDb API Key

Edit `lib/config.ts` and replace the placeholder TMDb API key with your actual key:

```typescript
TMDB_API_KEY: 'your-actual-tmdb-api-key-here',
```

Get your free API key from: https://www.themoviedb.org/settings/api

**That's it!** No database or environment variables needed.

### Step 2: Deploy to Vercel

1. **Push to GitHub**:
```bash
git add .
git commit -m "Ready for showcase deployment"
git push
```

2. **Deploy on Vercel**:
   - Go to https://vercel.com
   - Import your GitHub repo
   - **No environment variables needed!** Everything is hardcoded.
   - Deploy!

**Optional**: If you want to override the hardcoded values, you can add these in Vercel Dashboard → Settings → Environment Variables:

```env
# Optional overrides (already hardcoded in lib/config.ts)
TMDB_API_KEY=your-tmdb-api-key
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXT_PUBLIC_BASE_URL=https://your-app-name.vercel.app
```

But these are **not required** - everything works with hardcoded values!

## 🎯 What Works in Showcase Mode

✅ **Homepage** - Shows trending movies  
✅ **Movies Page** - Browse all movies  
✅ **Movie Details** - View movie info, showtimes  
✅ **Seat Selection** - Select seats (mock data)  
✅ **Booking Flow** - Complete booking process  
✅ **User Authentication** - Login/signup (mock users)  
✅ **My Bookings** - View bookings (stored in memory)  
✅ **All UI Features** - Fully functional!

## 📝 Demo Account

**Email**: `demo@cinesnap.com`  
**Password**: `demo123`

## ⚠️ Limitations

- Bookings are stored **in memory** (reset on server restart)
- Movies are fetched from TMDb API (requires internet)
- **2 theaters** (PVR, INOX) in Mumbai
- Data resets when Vercel serverless function restarts

**Perfect for showcasing your project!** 🎉

## 🔄 Switch Back to Real Database

To use a real database:
1. Edit `lib/config.ts` and set `SHOWCASE_MODE: false`
2. Add database connection variables to `.env.local`:
   ```
   DB_HOST=your-db-host
   DB_PORT=3306
   DB_USER=your-user
   DB_PASSWORD=your-password
   DB_NAME=your-db-name
   ```

## 🎨 Customize Configuration

Edit `lib/config.ts` to:
- Change TMDb API key
- Update NextAuth secret
- Modify base URLs
- Add payment keys (Stripe/Razorpay)

Edit `lib/mockData.ts` to:
- Change theaters
- Modify showtimes
- Add more demo users

---

**Perfect for portfolio projects!** No database setup, just deploy and showcase! 🚀

