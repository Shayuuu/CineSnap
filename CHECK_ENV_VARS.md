# 🔍 Check Environment Variables

## Quick Check

Run this command to see what MySQL variables are currently set:

```powershell
cd C:\Users\Rutaab\Desktop\Personal\CineSnap\textbookmyseat
Get-Content .env.local | Select-String -Pattern "DB_"
```

---

## Expected Output

You should see:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=bookmyseat
```

---

## If Variables Are Missing

1. **Open** `.env.local` file
2. **Add** these lines:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=bookmyseat
   ```
3. **Save** the file
4. **Restart** dev server (Ctrl+C, then `npm run dev`)

---

## Important Notes

- ✅ Variables must be in `.env.local` (not `.env`)
- ✅ No spaces around `=` sign
- ✅ No quotes around values (unless password has special chars)
- ✅ Must restart dev server after adding variables
- ✅ Next.js caches environment variables on startup

---

## Verify Variables Are Loaded

After restarting, check console output. You should see:
```
📋 MySQL Configuration:
   DB_HOST: localhost
   DB_PORT: 3306
   DB_USER: root
   DB_PASSWORD: ***SET***
   DB_NAME: bookmyseat
```

If you see `DB_PASSWORD: ❌ NOT SET`, the variable isn't being read.

---

## Troubleshooting

### Variables not loading?
1. ✅ File is named `.env.local` (not `.env.local.txt`)
2. ✅ File is in `textbookmyseat` folder (same folder as `package.json`)
3. ✅ No syntax errors (no extra spaces, quotes, etc.)
4. ✅ Restarted dev server after adding variables

### Still not working?
Check if there are multiple `.env` files:
```powershell
Get-ChildItem -Path . -Filter ".env*" -Force
```

Make sure you're editing the right one!

