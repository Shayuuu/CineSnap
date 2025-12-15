# 🔒 Alternative SSL Fix: Environment Variable

If the SSL configuration in code isn't working, you can use this temporary workaround:

## ⚠️ Temporary Solution (Development Only)

Add this to your `.env.local` file:

```env
NODE_TLS_REJECT_UNAUTHORIZED=0
```

**⚠️ WARNING**: This disables SSL certificate verification for ALL Node.js connections, not just the database. Only use this in development!

## ✅ Proper Solution (Recommended)

The code should handle SSL correctly. Make sure your `DATABASE_URL` includes `?sslmode=require`:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.giphqdjlnjbmrsspaspc.supabase.co:5432/postgres?sslmode=require
```

## 🔍 Verify Connection String

Check your connection string format:

1. **Must start with**: `postgresql://`
2. **Must include**: `?sslmode=require` at the end
3. **Password must be URL encoded** if it has special characters

## 🧪 Test Connection

After updating, restart your dev server and check the logs. You should see:
```
🔌 Connecting to PostgreSQL: db.giphqdjlnjbmrsspaspc.supabase.co:5432 (direct)
🔒 SSL configured for Supabase (self-signed certs accepted)
✅ Database connection successful!
```

---

**The code fix should work - make sure your connection string is correct!**


