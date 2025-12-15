# ⚠️ IMPORTANT: Database Engine Selection

## ❌ Wrong Selection Detected

You've selected **Postgres** as your database engine, but **CineSnap uses MySQL**!

## ✅ Correct Selection

**You MUST select "Vitess"** - This is MySQL at hyperscale.

---

## 🔧 How to Fix

1. **Click on "Vitess"** option (the one with red icon that says "MySQL at hyperscale")
2. **Keep your other settings**:
   - Database name: `bookmyseat` ✅
   - Region: Choose closest to you (or keep us-east-1)
   - Cluster: Primary + multi-replica is fine (or single node for cheaper)
3. **Click "Create database"**

---

## 💡 Why This Matters

- **Postgres** uses different SQL syntax (`$1, $2` placeholders)
- **MySQL** uses `?` placeholders (what our app uses)
- **Postgres** has different data types and functions
- Our app is built specifically for **MySQL**

---

## 📝 After Creating MySQL Database

Once you create the Vitess (MySQL) database:

1. **Get connection details** from your database dashboard
2. **Update your Vercel environment variables**:
   ```
   DB_HOST=your-vitess-host
   DB_PORT=3306
   DB_USER=your-username
   DB_PASSWORD=your-password
   DB_NAME=bookmyseat
   ```
3. **Run your SQL scripts** on the cloud database:
   - `mysql-complete-setup.sql`
   - `populate-mumbai-theaters-mysql.sql`

---

## 🎯 Quick Checklist

- [ ] Select **Vitess** (MySQL) instead of Postgres
- [ ] Database name: `bookmyseat`
- [ ] Choose region closest to you
- [ ] Create database
- [ ] Get connection string
- [ ] Add to Vercel environment variables
- [ ] Run SQL migrations

---

**Don't proceed with Postgres - it won't work with our app!** 🚨


