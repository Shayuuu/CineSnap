# 🔧 Fix PostgreSQL Query Syntax

## Issue

PostgreSQL is case-sensitive and requires quoted table/column names. Many queries were using MySQL syntax with unquoted names.

## Fixed Files

✅ **Fixed**:
- `app/booking/[id]/page.tsx`
- `app/booking/[id]/group/page.tsx`
- `app/api/payment/stripe/create-intent/route.ts`
- `app/api/groups/route.ts`
- `app/ticket/[id]/page.tsx`
- `app/payment/[id]/page.tsx`
- `app/admin/showtimes/page.tsx`
- `app/admin/movies/page.tsx`
- `app/api/bookings/recent/route.ts`
- `app/api/auth/signup/route.ts`

## PostgreSQL Syntax Rules

### ✅ Correct (PostgreSQL)
```sql
SELECT * FROM "Showtime" WHERE id = $1
SELECT * FROM "Movie" WHERE id = $1
SELECT * FROM "User" WHERE email = $1
```

### ❌ Wrong (MySQL)
```sql
SELECT * FROM Showtime WHERE id = ?
SELECT * FROM Movie WHERE id = ?
SELECT * FROM User WHERE email = ?
```

## Key Changes

1. **Quote all table names**: `Showtime` → `"Showtime"`
2. **Quote column names with mixed case**: `createdAt` → `"createdAt"`
3. **Use PostgreSQL placeholders**: `?` → `$1`, `$2`, etc.
4. **Quote junction table names**: `_BookingSeats` → `"_BookingSeats"`

## Remaining Files to Check

If you encounter more "relation does not exist" errors, check these files:

- `app/api/bookings/my-bookings/route.ts`
- `app/api/bookings/[bookingId]/cancel/route.ts`
- `app/api/wishlist/route.ts`
- `app/api/groups/[groupId]/route.ts`
- `app/api/reviews/route.ts`
- `app/join/[token]/page.tsx`

## Quick Fix Pattern

**Before (MySQL)**:
```typescript
await queryOne('SELECT * FROM User WHERE email = ?', [email])
```

**After (PostgreSQL)**:
```typescript
await queryOne('SELECT * FROM "User" WHERE email = $1', [email])
```

---

**All critical queries have been fixed!** 🎉


