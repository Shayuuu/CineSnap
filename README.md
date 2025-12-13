# 🎬 CineSnap - Premium Movie Booking Experience

A modern, full-featured movie ticket booking platform built with Next.js 16, TypeScript, MySQL, and real-time seat locking.

## ✨ Features

- 🎥 **Movie Discovery**: Browse now playing, upcoming, and popular movies from TMDb
- 🎫 **Real-time Seat Selection**: Interactive seat map with live locking
- 💳 **Multiple Payment Options**: Stripe and Razorpay integration
- 👥 **Group Booking**: Book tickets together with friends via shareable links
- ⭐ **Reviews & Ratings**: Rate and review movies
- ❤️ **Wishlist**: Save movies for later
- 🍿 **Food Ordering**: Order snacks and beverages
- 🎁 **Loyalty Points**: Earn rewards with every booking
- 📧 **Email Notifications**: Booking confirmations and reminders
- 🔄 **Cancellation & Refunds**: Cancel bookings with automatic refunds
- 🔍 **Advanced Search**: Search movies with filters
- 📱 **PWA Support**: Install as a mobile app

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MySQL 8+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd textbookmyseat

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Set up database
# Run SQL migrations in MySQL Workbench:
# - database-setup.sql
# - database-reviews.sql
# - database-group-booking.sql
# - database-wishlist-loyalty-food.sql
# - database-cancellation-refunds.sql

# Run development server
npm run dev
```

Visit http://localhost:3000

## 📦 Deployment

### Deploy to Vercel (Recommended)

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for complete deployment guide.

**Quick Steps**:
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

## 🔐 Environment Variables

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete list.

**Required**:
- `DATABASE_URL` - MySQL connection string
- `NEXTAUTH_URL` - Your app URL
- `NEXTAUTH_SECRET` - Random secret key
- `TMDB_API_KEY` - TMDb API key
- `NEXT_PUBLIC_BASE_URL` - Your app URL

## 🗄️ Database Schema

Run these SQL files in order:
1. `database-setup.sql` - Core tables
2. `database-reviews.sql` - Reviews
3. `database-group-booking.sql` - Group booking
4. `database-wishlist-loyalty-food.sql` - Wishlist, loyalty, food
5. `database-cancellation-refunds.sql` - Cancellations

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: MySQL
- **Caching**: Upstash Redis
- **Payments**: Stripe, Razorpay
- **Auth**: NextAuth.js
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **PDF**: @react-pdf/renderer

## 📁 Project Structure

```
textbookmyseat/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── movies/         # Movie pages
│   ├── booking/        # Booking pages
│   └── ...
├── components/         # React components
├── lib/                # Utility functions
├── public/             # Static assets
└── database-*.sql      # Database migrations
```

## 🎯 Key Features Explained

### Real-time Seat Locking
- Seats are locked for 10 minutes when selected
- Uses Redis for distributed locking
- Prevents double booking

### Group Booking
- Create groups with shareable links
- Live chat and polls
- Collaborative seat selection

### Payment Integration
- Stripe Checkout
- Razorpay integration
- Webhook handling for payment confirmation

### Email Notifications
- Booking confirmations
- Cancellation notifications
- Showtime reminders

## 📝 License

MIT

## 👨‍💻 Author

Built with ❤️ for movie lovers

---

**For deployment instructions, see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)**
