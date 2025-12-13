# 🗄️ MySQL Workbench Setup Guide

## Overview

This guide will help you set up MySQL Workbench and configure CineSnap to use MySQL instead of Supabase.

---

## 📋 Prerequisites

1. **MySQL Server** installed and running
2. **MySQL Workbench** installed
3. **Database created** (or we'll create it)

---

## 🚀 Step-by-Step Setup

### Step 1: Install MySQL Server

If you don't have MySQL installed:

**Windows**:
- Download MySQL Installer: https://dev.mysql.com/downloads/installer/
- Run installer and follow setup wizard
- Remember your root password!

**macOS**:
```bash
brew install mysql
brew services start mysql
```

**Linux**:
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
```

---

### Step 2: Create Database

1. **Open MySQL Workbench**
2. **Connect** to your MySQL server (usually `localhost:3306`)
3. **Create a new database**:
   ```sql
   CREATE DATABASE bookmyseat CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
4. **Or use the setup script** (see Step 4)

---

### Step 3: Update Environment Variables

Update your `.env.local` file:

```env
# =====================================================
# MySQL Database Configuration
# =====================================================
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=bookmyseat

# =====================================================
# NextAuth
# =====================================================
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=http://localhost:3000

# =====================================================
# TMDb API
# =====================================================
TMDB_API_KEY=your-tmdb-api-key

# =====================================================
# Base URL
# =====================================================
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# =====================================================
# Optional - Email
# =====================================================
EMAIL_SERVER=smtp://username:password@smtp.example.com:587
EMAIL_FROM=noreply@bookmyseat.com

# =====================================================
# Optional - Payment
# =====================================================
RAZORPAY_KEY=your_razorpay_key_id
RAZORPAY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

# =====================================================
# Optional - Redis
# =====================================================
UPSTASH_REDIS_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_TOKEN=your-redis-token
```

**Important**: Replace `your_mysql_password` with your actual MySQL root password.

---

### Step 4: Run Database Setup Script

1. **Open MySQL Workbench**
2. **Open** `mysql-complete-setup.sql` file
3. **Copy** the entire content
4. **Paste** into MySQL Workbench SQL Editor
5. **Click "Execute"** (or press Ctrl+Enter)

This will create all tables, indexes, and initial data.

---

### Step 5: Install Dependencies

```bash
npm install
```

This will install `mysql2` package.

---

### Step 6: Restart Dev Server

```bash
npm run dev
```

You should see:
```
🔌 Connecting to MySQL: localhost:3306/bookmyseat
✅ MySQL connection successful!
```

---

## 🔍 Verify Connection

### Test in MySQL Workbench

```sql
-- Check tables
SHOW TABLES;

-- Check users
SELECT * FROM User LIMIT 5;

-- Check movies
SELECT * FROM Movie LIMIT 5;
```

### Test in Application

1. Visit: http://localhost:3000
2. Check console for connection success message
3. Try logging in or browsing movies

---

## 🆘 Troubleshooting

### "Access denied for user"
- ✅ Check `DB_USER` and `DB_PASSWORD` in `.env.local`
- ✅ Verify MySQL user has permissions
- ✅ Try resetting MySQL root password

### "Unknown database 'bookmyseat'"
- ✅ Create database: `CREATE DATABASE bookmyseat;`
- ✅ Or update `DB_NAME` in `.env.local`

### "Can't connect to MySQL server"
- ✅ Check MySQL server is running
- ✅ Verify `DB_HOST` and `DB_PORT` (default: `localhost:3306`)
- ✅ Check firewall settings

### "Table doesn't exist"
- ✅ Run `mysql-complete-setup.sql` script
- ✅ Check database name matches `DB_NAME`

---

## 📝 MySQL vs PostgreSQL Differences

### Query Syntax

**MySQL** (what we're using now):
```sql
SELECT * FROM User WHERE email = ?
INSERT INTO Booking (id, userId) VALUES (?, ?)
```

**PostgreSQL** (what we had):
```sql
SELECT * FROM "User" WHERE email = $1
INSERT INTO "Booking" (id, "userId") VALUES ($1, $2)
```

### Key Differences:
- ✅ MySQL uses `?` placeholders (not `$1, $2`)
- ✅ MySQL table/column names don't need quotes (unless reserved words)
- ✅ MySQL uses `NOW()` instead of `CURRENT_TIMESTAMP` in some contexts
- ✅ MySQL uses backticks `` ` `` for identifiers (optional)

---

## ✅ You're All Set!

Your app is now using MySQL Workbench. All queries have been converted to MySQL syntax.

**Next Steps**:
1. ✅ Run `mysql-complete-setup.sql` to create tables
2. ✅ Test the application
3. ✅ Start using MySQL Workbench for database management

---

**Need help?** Check the console logs for specific error messages!

