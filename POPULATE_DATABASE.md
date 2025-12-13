# 🎬 Populate CineSnap Database - Complete Guide

## Overview

This guide will help you populate your Supabase database with:
1. ✅ Theaters in Mumbai (PVR, INOX, Cinepolis, Carnival)
2. ✅ Screens for each theater
3. ✅ Seats for each screen (STANDARD, PREMIUM, VIP)
4. ✅ Food & Beverages items
5. ✅ Showtimes (generated automatically)

---

## 📋 Prerequisites

1. ✅ Run `supabase-complete-setup.sql` first (creates all tables)
2. ✅ Have access to Supabase SQL Editor
3. ✅ Your Supabase project is active

---

## 🚀 Step-by-Step Instructions

### Step 1: Populate Theaters, Screens & Seats

1. **Open Supabase SQL Editor**:
   - Go to: https://supabase.com/dashboard/project/giphqdjlnjbmrsspaspc/sql/new

2. **Copy and paste** the entire content of `populate-mumbai-theaters.sql`

3. **Click "Run"** (or press Ctrl+Enter)

4. **Verify**:
   ```sql
   -- Check theaters
   SELECT id, name, location FROM "Theater" WHERE location = 'Mumbai' ORDER BY name;
   
   -- Check screens count
   SELECT t.name, COUNT(s.id) as screen_count
   FROM "Theater" t
   LEFT JOIN "Screen" s ON s."theaterId" = t.id
   WHERE t.location = 'Mumbai'
   GROUP BY t.id, t.name
   ORDER BY t.name;
   ```

**Expected Result**:
- ✅ 11 theaters in Mumbai
- ✅ ~40 screens across all theaters
- ✅ ~12,800 seats (40 screens × 16 rows × 20 seats)

---

### Step 2: Populate Food & Beverages

1. **In Supabase SQL Editor**, copy and paste `populate-food-items.sql`

2. **Click "Run"**

3. **Verify**:
   ```sql
   SELECT category, COUNT(*) as count FROM "FoodItem" GROUP BY category;
   ```

**Expected Result**:
- ✅ 4 Popcorn items
- ✅ 5 Drink items
- ✅ 6 Snack items
- ✅ 4 Combo items

---

### Step 3: Generate Showtimes (After Movies Are Added)

**Important**: Showtimes are generated automatically when you visit a movie detail page. However, you can also generate them manually:

1. **Wait for movies to be added** (they're added automatically from TMDb API when users browse)

2. **Or manually generate showtimes**:
   - Copy and paste `generate-showtimes.sql` in SQL Editor
   - Click "Run"
   - This generates showtimes for all movies for the next 7 days

3. **Verify**:
   ```sql
   SELECT 
       m.title,
       t.name as theater,
       sc.name as screen,
       s."startTime",
       s.price / 100.0 as price_rupees
   FROM "Showtime" s
   JOIN "Movie" m ON s."movieId" = m.id
   JOIN "Screen" sc ON s."screenId" = sc.id
   JOIN "Theater" t ON sc."theaterId" = t.id
   WHERE DATE(s."startTime") >= CURRENT_DATE
   ORDER BY s."startTime"
   LIMIT 20;
   ```

---

## 🎯 What Gets Created

### Theaters (11 total)
- **PVR Cinemas** (4 locations):
  - Phoenix Marketcity
  - ICON Infiniti Mall
  - Nexus Seawoods
  - IMAX Lower Parel

- **INOX Cinemas** (3 locations):
  - R City Mall
  - Nakshatra Mall
  - Megaplex Inorbit Mall

- **Cinepolis** (2 locations):
  - Seawoods Grand Central
  - R City Mall

- **Carnival Cinemas** (2 locations):
  - Sion
  - Wadala

### Screens
- ~40 screens across all theaters
- Each theater has 2-6 screens

### Seats
- **STANDARD**: Rows A-J (₹450-₹500)
- **PREMIUM**: Rows K-M (₹550-₹600)
- **VIP**: Rows N-P (₹650-₹750)
- 20 seats per row
- 16 rows per screen
- **Total: ~12,800 seats**

### Food Items
- **Popcorn**: Small, Medium, Large, Caramel (₹200-₹400)
- **Drinks**: Pepsi, Coke, Sprite, Water, Coffee (₹80-₹150)
- **Snacks**: Nachos, Fries, Sandwich, Burger, Pizza, Chocolate (₹100-₹300)
- **Combos**: Small, Medium, Large, Family (₹350-₹1,500)

### Showtimes
- Generated automatically for movies
- 5 time slots per day: 10:00, 13:00, 16:00, 19:00, 22:00
- Prices vary by theater:
  - Premium (PVR/INOX): ₹500-₹600
  - Regular: ₹450-₹500
  - IMAX: ₹600+

---

## 🔍 Verification Queries

### Check Everything is Set Up

```sql
-- Theaters count
SELECT COUNT(*) as theater_count FROM "Theater" WHERE location = 'Mumbai';

-- Screens count
SELECT COUNT(*) as screen_count FROM "Screen" s
JOIN "Theater" t ON s."theaterId" = t.id
WHERE t.location = 'Mumbai';

-- Seats count
SELECT COUNT(*) as seat_count FROM "Seat" s
JOIN "Screen" sc ON s."screenId" = sc.id
JOIN "Theater" t ON sc."theaterId" = t.id
WHERE t.location = 'Mumbai';

-- Seats by type
SELECT type, COUNT(*) as count FROM "Seat" s
JOIN "Screen" sc ON s."screenId" = sc.id
JOIN "Theater" t ON sc."theaterId" = t.id
WHERE t.location = 'Mumbai'
GROUP BY type;

-- Food items count
SELECT COUNT(*) as food_count FROM "FoodItem" WHERE available = TRUE;

-- Showtimes count (if movies exist)
SELECT COUNT(*) as showtime_count FROM "Showtime" 
WHERE "startTime" >= CURRENT_TIMESTAMP;
```

---

## 🆘 Troubleshooting

### "relation does not exist"
- ✅ Make sure you ran `supabase-complete-setup.sql` first
- ✅ Check table names are in double quotes: `"Theater"`, `"Screen"`, etc.

### "duplicate key value violates unique constraint"
- ✅ This is normal - the script uses `ON CONFLICT DO NOTHING`
- ✅ Means data already exists, skip and continue

### "type does not exist"
- ✅ Make sure ENUM types are created (from `supabase-complete-setup.sql`)
- ✅ Check: `SELECT typname FROM pg_type WHERE typname LIKE '%_type';`

### No showtimes generated
- ✅ Movies need to exist first (added from TMDb API)
- ✅ Visit a movie detail page to trigger showtime generation
- ✅ Or run `generate-showtimes.sql` manually

---

## 📝 Next Steps

After populating the database:

1. ✅ **Test the app** - Browse movies, select seats, make bookings
2. ✅ **Check showtimes** - Visit movie detail pages to see showtimes
3. ✅ **Test food ordering** - Add items to cart during booking
4. ✅ **Verify seat selection** - Try booking seats in different tiers

---

## 🎬 You're All Set!

Your database now has:
- ✅ 11 Mumbai theaters
- ✅ 40+ screens
- ✅ 12,800+ seats
- ✅ 19 food items
- ✅ Showtimes (generated automatically)

**Happy coding!** 🚀

