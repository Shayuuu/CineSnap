# ⚡ Quick Deployment Checklist

## TL;DR - Deploy in 5 Steps

### 1️⃣ Get Cloud MySQL Database
**Recommended: Railway (Free $5/month credit)**
- Sign up: https://railway.app (Login with GitHub)
- New Project → New Database → MySQL
- Get connection variables from Railway dashboard
- Run your SQL scripts (`mysql-complete-setup.sql` + `populate-mumbai-theaters-mysql.sql`)

**Alternative Free Options:**
- db4free.net (completely free, 200MB limit)
- See `FREE_MYSQL_OPTIONS.md` for more options

### 2️⃣ Push Code to GitHub
```bash
git init
git add .
git commit -m "Ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/cinesnap.git
git push -u origin main
```

### 3️⃣ Deploy on Vercel
- Go to https://vercel.com
- Sign up with GitHub
- Click "Add New Project"
- Import your repository
- Framework: Next.js (auto-detected)

### 4️⃣ Add Environment Variables in Vercel
Go to Project Settings → Environment Variables, add:

```
DB_HOST=your-cloud-db-host
DB_PORT=3306
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=cinesnap
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
TMDB_API_KEY=your-tmdb-key
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
```

### 5️⃣ Deploy!
Click "Deploy" and wait ~2 minutes.

---

## 🎯 That's It!

Your app will be live at: `https://your-app-name.vercel.app`

**Note**: MySQL Workbench is just a tool - you need a cloud MySQL database for Vercel deployment.

See `VERCEL_DEPLOYMENT_GUIDE.md` for detailed instructions.

