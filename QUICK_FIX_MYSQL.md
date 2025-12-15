# ⚡ Quick Fix: MySQL Connection Error

## Problem
```
❌ MySQL connection test failed: "Access denied for user 'root'@'localhost' (using password: NO)"
```

## Solution

Your `.env.local` file is missing MySQL connection variables. Add these lines to your `.env.local` file:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=bookmyseat
```

---

## Steps

1. **Open** `.env.local` file in `textbookmyseat` folder

2. **Add** these lines at the top:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_actual_mysql_password
   DB_NAME=bookmyseat
   ```

3. **Replace** `your_actual_mysql_password` with your real MySQL root password

4. **Save** the file

5. **Restart** your dev server:
   ```bash
   npm run dev
   ```

---

## Don't Know Your MySQL Password?

### Option 1: Check MySQL Workbench
- Open MySQL Workbench
- Look at your saved connections
- The password might be saved there

### Option 2: Reset MySQL Root Password

**Windows:**
```powershell
# Stop MySQL
net stop MySQL80

# Start MySQL without password check
mysqld --skip-grant-tables

# In new terminal, connect
mysql -u root

# Reset password
ALTER USER 'root'@'localhost' IDENTIFIED BY 'newpassword';
FLUSH PRIVILEGES;
EXIT;

# Restart MySQL normally
net start MySQL80
```

**macOS/Linux:**
```bash
sudo mysql -u root
ALTER USER 'root'@'localhost' IDENTIFIED BY 'newpassword';
FLUSH PRIVILEGES;
EXIT;
```

### Option 3: Create New MySQL User (Recommended)

```sql
CREATE USER 'bookmyseat'@'localhost' IDENTIFIED BY 'secure_password_123';
GRANT ALL PRIVILEGES ON bookmyseat.* TO 'bookmyseat'@'localhost';
FLUSH PRIVILEGES;
```

Then use in `.env.local`:
```env
DB_USER=bookmyseat
DB_PASSWORD=secure_password_123
```

---

## After Adding Variables

You should see:
```
🔌 Connecting to MySQL: localhost:3306/bookmyseat
✅ MySQL connection successful!
```

---

**Still stuck?** Check `SETUP_MYSQL_ENV.md` for detailed help!


