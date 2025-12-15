# 🚀 Vercel Deployment Guide for CineSnap

## ⚠️ Important: Database Requirements

**MySQL Workbench is just a GUI tool** - it's not a database hosting service. For Vercel deployment, you need a **cloud-hosted MySQL database** because:

- Vercel runs on cloud servers (not your local machine)
- Your local MySQL database isn't accessible from the internet
- Vercel functions need to connect to a publicly accessible database

---

## 📋 Step-by-Step Deployment Guide

### Step 1: Choose a Cloud MySQL Database Provider

Here are recommended options:

#### Option 1: **PlanetScale** (Recommended - Free Tier Available)
- ✅ Free tier: 1 database, 1GB storage
- ✅ Serverless MySQL
- ✅ Built for Vercel
- ✅ Auto-scaling
- 🔗 https://planetscale.com

#### Option 2: **Railway** (Easy Setup)
- ✅ Free tier: $5 credit/month
- ✅ Simple MySQL setup
- ✅ Good for beginners
- 🔗 https://railway.app

#### Option 3: **AWS RDS** (Production Ready)
- ✅ Highly scalable
- ✅ Pay-as-you-go
- ⚠️ More complex setup
- 🔗 https://aws.amazon.com/rds

#### Option 4: **DigitalOcean Managed Databases**
- ✅ Simple pricing
- ✅ Good performance
- 🔗 https://www.digitalocean.com/products/managed-databases

---

### Step 2: Set Up Cloud MySQL Database

#### Using PlanetScale (Recommended):

1. **Sign up** at https://planetscale.com
2. **Create a new database**:
   - Click "Create database"
   - Choose a name (e.g., `cinesnap`)
   - Select region closest to you
   - Click "Create database"

3. **Get connection details**:
   - Go to your database dashboard
   - Click "Connect"
   - Copy the connection string (it looks like: `mysql://username:password@host:port/database`)
   - **Note**: PlanetScale uses a different connection format, but we'll adapt it

4. **Create a branch** (for migrations):
   - Click "Branches"
   - Create a new branch called `main`

#### Using Railway:

1. **Sign up** at https://railway.app
2. **Create new project** → "New Database" → "MySQL"
3. **Get connection details** from the database dashboard
4. Copy the connection variables

---

### Step 3: Run Database Migrations on Cloud Database

You'll need to run your SQL setup scripts on the cloud database:

1. **Connect to your cloud database** using MySQL Workbench or any MySQL client
2. **Run these scripts** (in order):
   - `mysql-complete-setup.sql` - Creates all tables
   - `populate-mumbai-theaters-mysql.sql` - Adds theaters and seats

**Or use PlanetScale CLI** (if using PlanetScale):
```bash
npm install -g @planetscale/cli
pscale auth login
pscale connect cinesnap main --port 3309
# Then run your SQL scripts
```

---

### Step 4: Prepare Environment Variables

Create a `.env.production` file locally (for reference):

```env
# Database (Cloud MySQL)
DB_HOST=your-cloud-db-host.com
DB_PORT=3306
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=cinesnap

# NextAuth
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=generate-a-random-secret-here

# TMDb API
TMDB_API_KEY=your-tmdb-api-key

# Stripe (if using)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key

# Razorpay (if using)
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Upstash Redis (if using)
UPSTASH_REDIS_REST_URL=your-upstash-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-token

# Base URL
NEXT_PUBLIC_BASE_URL=https://your-app-name.vercel.app
```

**Generate NEXTAUTH_SECRET**:
```bash
openssl rand -base64 32
```

---

### Step 5: Deploy to Vercel

#### Method 1: Using Vercel CLI

1. **Install Vercel CLI**:
```bash
npm i -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy**:
```bash
cd textbookmyseat
vercel
```

4. **Follow the prompts**:
   - Link to existing project? **No** (first time)
   - Project name: `cinesnap` (or your choice)
   - Directory: `./`
   - Override settings? **No**

5. **Add environment variables**:
```bash
vercel env add DB_HOST
vercel env add DB_PORT
vercel env add DB_USER
vercel env add DB_PASSWORD
vercel env add DB_NAME
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET
vercel env add TMDB_API_KEY
vercel env add NEXT_PUBLIC_BASE_URL
# Add all other variables...
```

#### Method 2: Using Vercel Dashboard (Easier)

1. **Push your code to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/cinesnap.git
git push -u origin main
```

2. **Go to Vercel Dashboard**:
   - Visit https://vercel.com
   - Sign up/Login with GitHub
   - Click "Add New Project"

3. **Import your repository**:
   - Select your GitHub repository
   - Click "Import"

4. **Configure project**:
   - Framework Preset: **Next.js**
   - Root Directory: `textbookmyseat` (if your repo root is different)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

5. **Add Environment Variables**:
   - Go to "Environment Variables" section
   - Add each variable from Step 4
   - Make sure to add them for:
     - ✅ Production
     - ✅ Preview
     - ✅ Development (optional)

6. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete

---

### Step 6: Update Database Connection for Production

If your cloud database requires SSL (most do), update `lib/db.ts`:

```typescript
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : undefined
})
```

---

### Step 7: Verify Deployment

1. **Check your Vercel deployment URL**: `https://your-app-name.vercel.app`
2. **Test the app**:
   - Homepage loads
   - Movies page works
   - Can create account/login
   - Can book seats
   - Database queries work

---

## 🔧 Troubleshooting

### Issue: Database Connection Errors

**Solution**:
- Check environment variables are set correctly in Vercel
- Verify database allows connections from Vercel IPs (check firewall settings)
- Ensure SSL is configured if required
- Check database credentials are correct

### Issue: Build Fails

**Solution**:
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version (Vercel uses Node 18+ by default)
- Check for TypeScript errors

### Issue: API Routes Not Working

**Solution**:
- Verify `NEXT_PUBLIC_BASE_URL` is set correctly
- Check API route logs in Vercel dashboard
- Ensure database connection is working
- Check CORS settings if needed

---

## 📝 Important Notes

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Use Vercel's environment variables** for production secrets
3. **Database migrations** - Run them manually on cloud database before first deployment
4. **SSL Certificates** - Most cloud databases require SSL in production
5. **Connection Limits** - Cloud databases have connection limits, use connection pooling (already implemented)

---

## 🎯 Quick Checklist

- [ ] Cloud MySQL database created
- [ ] Database migrations run on cloud database
- [ ] Environment variables prepared
- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables added to Vercel
- [ ] Deployment successful
- [ ] App tested on production URL

---

## 💡 Pro Tips

1. **Use PlanetScale** - It's free and works seamlessly with Vercel
2. **Enable Vercel Analytics** - Monitor your app performance
3. **Set up Preview Deployments** - Test before merging to main
4. **Use Vercel Environment Variables** - Don't hardcode secrets
5. **Monitor Database Usage** - Keep an eye on connection limits

---

## 🆘 Need Help?

If you encounter issues:
1. Check Vercel deployment logs
2. Check database connection logs
3. Verify all environment variables are set
4. Test database connection locally with cloud credentials first

Good luck with your deployment! 🚀


