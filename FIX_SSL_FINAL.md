# 🔒 Final Fix for SSL Certificate Error

## Current Error
```
Database query error: self-signed certificate in certificate chain
code: 'SELF_SIGNED_CERT_IN_CHAIN'
```

## Root Cause

The `pg` library is still rejecting Supabase's self-signed certificate even though we set `rejectUnauthorized: false`. This can happen if:

1. The SSL config isn't being applied correctly
2. The connection string format is incorrect
3. Node.js TLS settings are interfering

## ✅ Solution: Use Connection String SSL Mode

The most reliable way is to ensure your `DATABASE_URL` includes proper SSL parameters:

### Option 1: Add `sslmode=require` (Recommended)

Your connection string should look like:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.giphqdjlnjbmrsspaspc.supabase.co:5432/postgres?sslmode=require
```

### Option 2: Use `sslmode=prefer` (More Flexible)

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.giphqdjlnjbmrsspaspc.supabase.co:5432/postgres?sslmode=prefer
```

### Option 3: Use Connection Pooler (Often More Reliable)

```env
DATABASE_URL=postgresql://postgres.giphqdjlnjbmrsspaspc:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
```

**Note**: Pooler uses `postgres.PROJECT_REF` as username, not just `postgres`.

---

## 🔍 Check Your Current Connection String

From the logs, I see: `123@db.giphqdjlnjbmrsspaspc.supabase.co:5432`

This suggests the username is being parsed as "123", which is wrong. Your connection string format might be incorrect.

### Correct Format:
```
postgresql://postgres:PASSWORD@db.giphqdjlnjbmrsspaspc.supabase.co:5432/postgres?sslmode=require
```

### Common Mistakes:

❌ **Wrong**: Missing `postgresql://` prefix
```
postgres:PASSWORD@db.giphqdjlnjbmrsspaspc.supabase.co:5432/postgres
```

❌ **Wrong**: Using `https://` instead of `postgresql://`
```
https://postgres:PASSWORD@db.giphqdjlnjbmrsspaspc.supabase.co:5432/postgres
```

❌ **Wrong**: Password with unencoded special characters
```
postgresql://postgres:My@Pass#123@db.giphqdjlnjbmrsspaspc.supabase.co:5432/postgres
```
Should be: `My%40Pass%23123`

---

## 🛠️ Quick Fix Steps

1. **Get your connection string from Supabase**:
   - Go to: https://supabase.com/dashboard/project/giphqdjlnjbmrsspaspc/settings/database
   - Scroll to "Connection string" → "URI" tab
   - Copy the exact string shown

2. **Replace `[YOUR-PASSWORD]`** with your actual password

3. **URL encode special characters** in password if needed:
   - `@` → `%40`
   - `#` → `%23`
   - `%` → `%25`
   - `&` → `%26`
   - `+` → `%2B`
   - `=` → `%3D`

4. **Ensure it ends with `?sslmode=require`**

5. **Update `.env.local`**:
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_ENCODED_PASSWORD@db.giphqdjlnjbmrsspaspc.supabase.co:5432/postgres?sslmode=require
   ```

6. **Restart dev server**

---

## 🧪 Test Connection

After updating, you should see in logs:
```
🔌 Connecting to PostgreSQL: db.giphqdjlnjbmrsspaspc.supabase.co:5432 (direct)
🔒 SSL configured for Supabase (self-signed certs accepted)
✅ Database connection successful!
```

If you still see errors, try the connection pooler (port 6543) instead.

---

## 📝 Complete Example

If your password is `My@Pass#123`, your connection string should be:

```env
DATABASE_URL=postgresql://postgres:My%40Pass%23123@db.giphqdjlnjbmrsspaspc.supabase.co:5432/postgres?sslmode=require
```

---

**The SSL config in code is correct - the issue is likely the connection string format!** 🔧

