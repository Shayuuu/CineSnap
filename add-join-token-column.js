// Script to add joinToken column to GroupBooking table if it doesn't exist
const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

// Read .env.local file manually
const envPath = path.join(__dirname, '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  })
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

async function addJoinTokenColumn() {
  try {
    console.log('🔍 Checking if joinToken column exists...')
    
    // Check if column exists
    const checkResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'GroupBooking' 
      AND column_name = 'joinToken'
    `)
    
    if (checkResult.rows.length > 0) {
      console.log('✅ joinToken column already exists!')
      return
    }
    
    console.log('➕ Adding joinToken column...')
    
    // Add the column
    await pool.query(`
      ALTER TABLE "GroupBooking" 
      ADD COLUMN IF NOT EXISTS "joinToken" VARCHAR(255) UNIQUE
    `)
    
    console.log('✅ joinToken column added successfully!')
    
    // Update existing groups to have join tokens
    console.log('🔄 Generating join tokens for existing groups...')
    const groups = await pool.query('SELECT id FROM "GroupBooking" WHERE "joinToken" IS NULL')
    
    for (const group of groups.rows) {
      const joinToken = `GB${require('crypto').randomBytes(8).toString('hex').toUpperCase()}`
      await pool.query(
        'UPDATE "GroupBooking" SET "joinToken" = $1 WHERE id = $2',
        [joinToken, group.id]
      )
    }
    
    console.log(`✅ Generated join tokens for ${groups.rows.length} existing groups`)
    
    // Make the column NOT NULL after updating existing rows
    await pool.query(`
      ALTER TABLE "GroupBooking" 
      ALTER COLUMN "joinToken" SET NOT NULL
    `)
    
    console.log('✅ Migration completed successfully!')
  } catch (error) {
    console.error('❌ Error:', error.message)
    throw error
  } finally {
    await pool.end()
  }
}

addJoinTokenColumn()
  .then(() => {
    console.log('✅ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Failed:', error)
    process.exit(1)
  })

