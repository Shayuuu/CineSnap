// Seed Neon PostgreSQL Database with Sample Data
// Run: node seed-neon-data.js

const { Pool } = require('pg')
const { randomBytes } = require('crypto')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_rWQJG46OfCdw@ep-weathered-poetry-ad2sytyw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
})

function generateId() {
  return randomBytes(16).toString('hex')
}

async function seedData() {
  try {
    console.log('🌱 Seeding database with sample data...\n')

    // Check if data already exists
    const existingTheaters = await pool.query('SELECT COUNT(*) FROM "Theater"')
    if (parseInt(existingTheaters.rows[0].count) > 0) {
      console.log('⚠️  Data already exists. Skipping seed.')
      console.log('   To reseed, delete existing data first.')
      await pool.end()
      return
    }

    // 1. Create Theaters
    console.log('📽️  Creating theaters...')
    const theaters = [
      { id: generateId(), name: 'PVR Cinemas', location: 'Mumbai' },
      { id: generateId(), name: 'INOX', location: 'Mumbai' },
      { id: generateId(), name: 'Cinepolis', location: 'Mumbai' },
      { id: generateId(), name: 'PVR Cinemas', location: 'Delhi' },
      { id: generateId(), name: 'INOX', location: 'Bangalore' },
    ]

    for (const theater of theaters) {
      await pool.query(
        'INSERT INTO "Theater" (id, name, location) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [theater.id, theater.name, theater.location]
      )
    }
    console.log(`   ✓ Created ${theaters.length} theaters\n`)

    // 2. Create Screens
    console.log('🎬 Creating screens...')
    const screens = []
    for (const theater of theaters) {
      for (let i = 1; i <= 3; i++) {
        screens.push({
          id: generateId(),
          theaterId: theater.id,
          name: `Screen ${i}`
        })
      }
    }

    for (const screen of screens) {
      await pool.query(
        'INSERT INTO "Screen" (id, "theaterId", name) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [screen.id, screen.theaterId, screen.name]
      )
    }
    console.log(`   ✓ Created ${screens.length} screens\n`)

    // 3. Create Seats
    console.log('💺 Creating seats...')
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
    const seatTypes = ['STANDARD', 'PREMIUM', 'VIP']
    let seatCount = 0

    for (const screen of screens) {
      for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const row = rows[rowIndex]
        const seatsPerRow = 15
        const type = rowIndex < 3 ? 'VIP' : rowIndex < 6 ? 'PREMIUM' : 'STANDARD'

        for (let num = 1; num <= seatsPerRow; num++) {
          const seatId = generateId()
          await pool.query(
            'INSERT INTO "Seat" (id, "row", "number", type, "screenId") VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
            [seatId, row, num, type, screen.id]
          )
          seatCount++
        }
      }
    }
    console.log(`   ✓ Created ${seatCount} seats\n`)

    // 4. Create Sample Food Items
    console.log('🍿 Creating food items...')
    const foodItems = [
      { name: 'Popcorn (Large)', description: 'Fresh popped popcorn', price: 20000, category: 'Snacks' },
      { name: 'Coca Cola', description: '500ml cold drink', price: 8000, category: 'Beverages' },
      { name: 'Nachos with Cheese', description: 'Crispy nachos with cheese dip', price: 25000, category: 'Snacks' },
      { name: 'Pepsi', description: '500ml cold drink', price: 8000, category: 'Beverages' },
      { name: 'Hot Dog', description: 'Classic hot dog', price: 30000, category: 'Snacks' },
      { name: 'Coffee', description: 'Hot coffee', price: 12000, category: 'Beverages' },
    ]

    for (const item of foodItems) {
      const foodId = generateId()
      await pool.query(
        'INSERT INTO "FoodItem" (id, name, description, price, category) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
        [foodId, item.name, item.description, item.price, item.category]
      )
    }
    console.log(`   ✓ Created ${foodItems.length} food items\n`)

    console.log('✅ Database seeding complete!')
    console.log('\n📊 Summary:')
    console.log(`   - ${theaters.length} theaters`)
    console.log(`   - ${screens.length} screens`)
    console.log(`   - ${seatCount} seats`)
    console.log(`   - ${foodItems.length} food items`)

    await pool.end()
  } catch (error) {
    console.error('❌ Seeding failed:', error.message)
    console.error(error.stack)
    await pool.end()
    process.exit(1)
  }
}

seedData()

