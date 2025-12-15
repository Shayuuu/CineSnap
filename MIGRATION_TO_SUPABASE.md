# 🔄 Migration to Supabase - Quick Reference

## ✅ What's Been Updated

### 1. Database Client (`lib/db.ts`)
- ✅ Changed from `mysql2` to `pg` (PostgreSQL)
- ✅ Added automatic `?` to `$1, $2` conversion
- ✅ Added SSL support for Supabase
- ✅ Updated connection string parsing for PostgreSQL

### 2. Package Dependencies (`package.json`)
- ✅ Replaced `mysql2` with `pg` and `@types/pg`

### 3. SQL Migration Files
- ✅ Created PostgreSQL versions:
  - `database-setup-postgres.sql`
  - `database-reviews-postgres.sql`
  - `database-group-booking-postgres.sql`
  - `database-wishlist-loyalty-food-postgres.sql`

### 4. Updated SQL Queries
- ✅ Updated key queries in:
  - `app/movies/[id]/page.tsx`
  - `app/booking/[id]/page.tsx`
  - `app/api/bookings/create/route.ts`
  - `lib/auth.ts`

## ⚠️ Remaining Updates Needed

Some API routes still use MySQL syntax. The `convertQuery` function handles `?` placeholders automatically, but you may need to update:

1. **Table/Column Names**: Use double quotes for PostgreSQL:
   - `User` → `"User"`
   - `userId` → `"userId"`
   - `row`, `number` → `row`, `number` (no quotes needed, but watch for conflicts)

2. **INSERT IGNORE**: Replace with:
   ```sql
   INSERT INTO "Table" (...) VALUES (...) ON CONFLICT (id) DO NOTHING
   ```

3. **NOW()**: Can stay as `NOW()` or use `CURRENT_TIMESTAMP` (both work in PostgreSQL)

## 🚀 Next Steps

1. **Install PostgreSQL dependencies**:
   ```bash
   npm install pg @types/pg
   npm uninstall mysql2
   ```

2. **Set up Supabase**: Follow [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

3. **Update Environment Variable**:
   ```env
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres?sslmode=require
   ```

4. **Test Locally**:
   ```bash
   npm run dev
   ```

5. **Deploy to Vercel**: Follow [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

## 📝 Notes

- The `convertQuery` function automatically converts `?` placeholders to PostgreSQL `$1, $2` format
- Most queries will work, but table/column names may need double quotes
- Test thoroughly before deploying to production


