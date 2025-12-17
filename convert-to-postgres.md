# MySQL to PostgreSQL Conversion Guide

This document lists all the files that need MySQL to PostgreSQL conversion.

## Conversion Rules

1. **Placeholders**: `?` → `$1, $2, $3...`
2. **Table Names**: Quote reserved words: `User` → `"User"`, `Showtime` → `"Showtime"`
3. **Column Names**: Quote reserved words: `` `row` `` → `"row"`, `` `number` `` → `"number"`
4. **Upsert**: `ON DUPLICATE KEY UPDATE` → `ON CONFLICT (column) DO UPDATE SET ...`
5. **Transactions**: 
   - `connection.beginTransaction()` → `connection.query('BEGIN')`
   - `connection.commit()` → `connection.query('COMMIT')`
   - `connection.rollback()` → `connection.query('ROLLBACK')`
   - `connection.execute()` → `connection.query()` (for transactions)
6. **Error Codes**: `ER_DUP_ENTRY` → `23505` (PostgreSQL unique violation)

## Files to Convert

### High Priority (Core Functionality)
- [x] `lib/db.ts` - Database connection
- [x] `lib/auth.ts` - Authentication
- [x] `app/api/auth/signup/route.ts` - User signup
- [x] `app/api/bookings/create/route.ts` - Booking creation
- [ ] `app/booking/[id]/page.tsx` - Booking page
- [ ] `app/movies/[id]/page.tsx` - Movie detail page
- [ ] `app/api/movies/[id]/showtimes/route.ts` - Showtimes API
- [ ] `app/ticket/[id]/page.tsx` - Ticket page
- [ ] `app/payment/[id]/page.tsx` - Payment page

### Medium Priority
- [ ] `app/api/bookings/my-bookings/route.ts`
- [ ] `app/api/bookings/recent/route.ts`
- [ ] `app/api/bookings/[bookingId]/cancel/route.ts`
- [ ] `app/api/payment/stripe/create-intent/route.ts`
- [ ] `app/api/payment/webhook/route.ts`
- [ ] `app/api/groups/route.ts`
- [ ] `app/api/food/route.ts`

### Lower Priority (Optional Features)
- [ ] `app/api/loyalty/route.ts`
- [ ] `app/api/wishlist/route.ts`
- [ ] `app/api/reviews/route.ts`
- [ ] `app/api/groups/join/[token]/route.ts`
- [ ] `app/api/groups/[groupId]/messages/route.ts`
- [ ] `app/api/groups/[groupId]/polls/route.ts`
- [ ] `app/admin/showtimes/page.tsx`
- [ ] `app/admin/movies/page.tsx`

## Quick Conversion Examples

### Example 1: Simple Query
```sql
-- MySQL
SELECT * FROM User WHERE email = ?

-- PostgreSQL
SELECT * FROM "User" WHERE email = $1
```

### Example 2: Insert with Upsert
```sql
-- MySQL
INSERT INTO User (id, email) VALUES (?, ?) ON DUPLICATE KEY UPDATE id=id

-- PostgreSQL
INSERT INTO "User" (id, email) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET id = EXCLUDED.id
```

### Example 3: Reserved Words
```sql
-- MySQL
SELECT `row`, `number` FROM Seat WHERE id = ?

-- PostgreSQL
SELECT "row", "number" FROM "Seat" WHERE id = $1
```

### Example 4: Transactions
```javascript
// MySQL
await connection.beginTransaction()
await connection.execute('INSERT INTO ...', [...])
await connection.commit()

// PostgreSQL
await connection.query('BEGIN')
await connection.query('INSERT INTO ...', [...])
await connection.query('COMMIT')
```

### Example 5: Dynamic Placeholders
```javascript
// MySQL
const placeholders = seatIds.map(() => '?').join(',')
await query(`SELECT * FROM Seat WHERE id IN (${placeholders})`, seatIds)

// PostgreSQL
const placeholders = seatIds.map((_, i) => `$${i + 1}`).join(',')
await query(`SELECT * FROM "Seat" WHERE id IN (${placeholders})`, seatIds)
```

