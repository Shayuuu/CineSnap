# 🔧 MySQL Environment Variables Setup

## Error Fix

The error `Access denied for user 'root'@'localhost' (using password: NO)` means MySQL connection variables are missing from `.env.local`.

---

## ✅ Solution: Add MySQL Variables to `.env.local`

Open your `.env.local` file and add these MySQL connection variables:

```env
# =====================================================
# MySQL Database Configuration
# =====================================================
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=bookmyseat

# =====================================================
# Keep your existing variables below
# =====================================================
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=http://localhost:3000
TMDB_API_KEY=c45a857c193f6302f2b5061c3b85e743
NEXT_PUBLIC_BASE_URL=http://localhost:3000
# ... etc
```

---

## 🔍 How to Find Your MySQL Password

### Option 1: If you remember your MySQL root password
- Use that password for `DB_PASSWORD`

### Option 2: If you forgot your MySQL root password
**Windows:**
1. Stop MySQL service:
   ```powershell
   net stop MySQL80
   ```
2. Start MySQL in safe mode (skip password):
   ```powershell
   mysqld --skip-grant-tables
   ```
3. Open new terminal, connect:
   ```bash
   mysql -u root
   ```
4. Reset password:
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
   FLUSH PRIVILEGES;
   ```
5. Restart MySQL service normally

**macOS/Linux:**
```bash
sudo mysql -u root
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
```

### Option 3: Create a new MySQL user (Recommended)
1. Open MySQL Workbench
2. Connect as root
3. Run:
   ```sql
   CREATE USER 'bookmyseat'@'localhost' IDENTIFIED BY 'your_secure_password';
   GRANT ALL PRIVILEGES ON bookmyseat.* TO 'bookmyseat'@'localhost';
   FLUSH PRIVILEGES;
   ```
4. Use in `.env.local`:
   ```env
   DB_USER=bookmyseat
   DB_PASSWORD=your_secure_password
   ```

---

## 📝 Complete `.env.local` Template

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
NEXTAUTH_SECRET=your-random-secret-here-generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# =====================================================
# TMDb API
# =====================================================
TMDB_API_KEY=c45a857c193f6302f2b5061c3b85e743

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

---

## ✅ After Adding Variables

1. **Save** `.env.local`
2. **Restart** your dev server:
   ```bash
   npm run dev
   ```
3. You should see:
   ```
   🔌 Connecting to MySQL: localhost:3306/bookmyseat
   ✅ MySQL connection successful!
   ```

---

## 🆘 Still Having Issues?

### "Access denied" even with password
- ✅ Verify MySQL server is running
- ✅ Check password is correct (no extra spaces)
- ✅ Try connecting manually:
  ```bash
  mysql -u root -p
  ```

### "Unknown database 'bookmyseat'"
- ✅ Create database:
  ```sql
  CREATE DATABASE bookmyseat CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```
- ✅ Or run `mysql-complete-setup.sql` which creates it automatically

### "Can't connect to MySQL server"
- ✅ Check MySQL service is running:
  ```powershell
  # Windows
  Get-Service MySQL*
  ```
- ✅ Verify `DB_HOST` and `DB_PORT` are correct

---

## 🎯 Quick Checklist

- [ ] MySQL server is running
- [ ] `.env.local` has `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- [ ] Password is correct (no quotes needed)
- [ ] Database `bookmyseat` exists (or will be created by setup script)
- [ ] Restarted dev server after adding variables

---

**Need more help?** Check `MYSQL_SETUP.md` for complete setup guide!


