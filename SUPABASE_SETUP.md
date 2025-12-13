# 🗄️ Supabase Setup Guide for CineSnap

Complete guide to set up Supabase PostgreSQL database for CineSnap.

---

## 📋 Step 1: Create Supabase Project

1. **Sign Up**: Go to https://supabase.com
2. **Create New Project**:
   - Click "New Project"
   - Name: `cinesnap` (or your preferred name)
   - Database Password: Create a strong password (save it!)
   - Region: Choose closest to you
   - Plan: Free tier is fine to start

3. **Wait for Setup**: Takes 1-2 minutes

---

## 🔗 Step 2: Get Connection String

1. Go to your project dashboard
2. Click **"Settings"** → **"Database"**
3. Scroll to **"Connection string"**
4. Copy the **"URI"** connection string
   - Format: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`
5. **Save this** - you'll need it for Vercel environment variables

---

## 🗄️ Step 3: Run Database Migrations

### Option A: Using Supabase SQL Editor (Recommended)

1. Go to **"SQL Editor"** in your Supabase dashboard
2. Click **"New query"**
3. Run these SQL files **in order**:

#### 1. Main Database Setup
```sql
-- Copy and paste contents of: database-setup-postgres.sql
-- Then click "Run"
```

#### 2. Reviews Table
```sql
-- Copy and paste contents of: database-reviews-postgres.sql
-- Then click "Run"
```

#### 3. Group Booking Tables
```sql
-- Copy and paste contents of: database-group-booking-postgres.sql
-- Then click "Run"
```

#### 4. Wishlist, Loyalty, Food Tables
```sql
-- Copy and paste contents of: database-wishlist-loyalty-food-postgres.sql
-- Then click "Run"
```

### Option B: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

---

## ✅ Step 4: Verify Tables Created

1. Go to **"Table Editor"** in Supabase dashboard
2. You should see these tables:
   - User
   - Movie
   - Theater
   - Screen
   - Seat
   - Showtime
   - Booking
   - _BookingSeats
   - SeatLock
   - Review
   - BookingGroup
   - GroupMember
   - GroupMessage
   - GroupPoll
   - GroupPollOption
   - GroupPollVote
   - Wishlist
   - LoyaltyPoints
   - LoyaltyPointsHistory
   - FoodItem
   - FoodOrder
   - FoodOrderItem
   - CancellationRequest
   - RefundTransaction
   - UserWallet
   - WalletTransaction

---

## 🔐 Step 5: Configure Row Level Security (RLS)

Supabase uses Row Level Security. For now, we'll disable it (you can enable later for production):

1. Go to **"Authentication"** → **"Policies"**
2. For each table, you can either:
   - **Disable RLS** (for development): Go to table → Settings → Disable RLS
   - **Or create policies** (for production): Allow all operations for authenticated users

**Quick RLS Disable Script** (run in SQL Editor):
```sql
-- Disable RLS on all tables (for development only)
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Movie" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Theater" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Screen" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Seat" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Showtime" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Booking" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "_BookingSeats" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "SeatLock" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Review" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "BookingGroup" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "GroupMember" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "GroupMessage" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "GroupPoll" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "GroupPollOption" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "GroupPollVote" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Wishlist" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "LoyaltyPoints" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "LoyaltyPointsHistory" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "FoodItem" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "FoodOrder" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "FoodOrderItem" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "CancellationRequest" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "RefundTransaction" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "UserWallet" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "WalletTransaction" DISABLE ROW LEVEL SECURITY;
```

---

## 📝 Step 6: Insert Sample Data (Optional)

Run this in SQL Editor:

```sql
-- Sample Theaters
INSERT INTO "Theater" (id, name, location) VALUES
  ('theater1', 'PVR Cinemas', 'Mumbai'),
  ('theater2', 'INOX', 'Delhi'),
  ('theater3', 'Cinepolis', 'Bangalore')
ON CONFLICT (id) DO NOTHING;

-- Sample Screens
INSERT INTO "Screen" (id, name, "theaterId") VALUES
  ('screen1', 'Screen 1', 'theater1'),
  ('screen2', 'Screen 2', 'theater1'),
  ('screen3', 'Screen 1', 'theater2')
ON CONFLICT (id) DO NOTHING;

-- Sample Seats (for screen1)
INSERT INTO "Seat" (id, row, number, type, "screenId")
SELECT 
  'seat_' || row || '_' || num,
  row,
  num,
  CASE 
    WHEN num <= 5 THEN 'VIP'
    WHEN num <= 10 THEN 'PREMIUM'
    ELSE 'STANDARD'
  END,
  'screen1'
FROM (
  SELECT row, num
  FROM (SELECT unnest(ARRAY['A','B','C','D','E','F','G','H']) as row) r
  CROSS JOIN generate_series(1, 15) as num
) seats
ON CONFLICT (id) DO NOTHING;
```

---

## 🔧 Step 7: Update Vercel Environment Variables

1. Go to your Vercel project
2. **Settings** → **Environment Variables**
3. Update `DATABASE_URL`:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
   Replace `[YOUR-PASSWORD]` with your actual database password

4. **Important**: Make sure connection string includes `?sslmode=require` for production:
   ```
   postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres?sslmode=require
   ```

---

## ✅ Step 8: Test Connection

After deploying to Vercel, test your database connection:

1. Try creating a user account
2. Check Supabase **"Table Editor"** → **"User"** table
3. You should see the new user

---

## 🔒 Step 9: Security Best Practices

### For Production:

1. **Enable RLS** and create proper policies
2. **Use connection pooling**: Supabase provides connection pooler URL
   - Go to Settings → Database → Connection Pooling
   - Use the pooler URL instead of direct connection
   - Format: `postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`

3. **Set up database backups**: Supabase auto-backups (check your plan)

---

## 🆘 Troubleshooting

### Connection Errors

**Error**: "Connection refused"
- **Solution**: Check your connection string is correct
- Verify password doesn't have special characters (URL encode if needed)
- Check Supabase project is active

**Error**: "SSL required"
- **Solution**: Add `?sslmode=require` to connection string

### Query Errors

**Error**: "Column does not exist"
- **Solution**: Check table names use double quotes: `"User"` not `User`
- Verify migrations ran successfully

**Error**: "Type does not exist"
- **Solution**: Make sure ENUM types were created before tables
- Run migrations in correct order

### RLS Errors

**Error**: "New row violates row-level security policy"
- **Solution**: Disable RLS for development or create proper policies

---

## 📚 Additional Resources

- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Connection Pooling**: https://supabase.com/docs/guides/database/connecting-to-postgres

---

## ✅ Checklist

- [ ] Supabase project created
- [ ] Connection string copied
- [ ] All migrations run successfully
- [ ] Tables visible in Table Editor
- [ ] RLS disabled (or policies created)
- [ ] Sample data inserted (optional)
- [ ] Vercel environment variable updated
- [ ] Connection tested

---

**Your Supabase database is now ready! 🎉**

Proceed with Vercel deployment using the connection string.

