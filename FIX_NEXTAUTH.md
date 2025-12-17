# Fix NextAuth CLIENT_FETCH_ERROR

## Problem
NextAuth is returning HTML instead of JSON, causing `CLIENT_FETCH_ERROR`.

## Solution

### 1. Add Required Environment Variables

Your `.env.local` file needs:

```env
DATABASE_URL=postgresql://neondb_owner:npg_rWQJG46OfCdw@ep-weathered-poetry-ad2sytyw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
NEXTAUTH_SECRET=v/8d0FVObC36nRnJPPIeP2yIi/EkyHeCE6zZu2yOvQw=
NEXTAUTH_URL=http://localhost:3000
```

### 2. Restart Dev Server

After adding environment variables:

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

### 3. Verify NextAuth Route

The route at `/api/auth/[...nextauth]` should return JSON, not HTML.

Test it:
```
http://localhost:3000/api/auth/providers
```

Should return JSON like:
```json
{"credentials":{"id":"credentials","name":"Credentials","type":"credentials"}}
```

### 4. Common Issues

- **Missing NEXTAUTH_SECRET**: NextAuth can't encrypt sessions
- **Wrong NEXTAUTH_URL**: NextAuth can't generate correct callback URLs
- **Server not restarted**: Environment variables not loaded

### 5. Check Browser Console

After restarting, check:
- No more `CLIENT_FETCH_ERROR`
- Session loads correctly
- Login page works

