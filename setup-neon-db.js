// Setup Neon PostgreSQL Database
// Run this script to create all tables: node setup-neon-db.js

const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_rWQJG46OfCdw@ep-weathered-poetry-ad2sytyw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
})

async function setupDatabase() {
  try {
    console.log('🔌 Connecting to Neon PostgreSQL...')
    
    // Test connection
    const testResult = await pool.query('SELECT NOW() as current_time')
    console.log('✅ Connected! Current time:', testResult.rows[0].current_time)
    
    // Read schema file
    const schemaPath = path.join(__dirname, 'neon-schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    console.log('\n📋 Running schema...')
    
    // Split by semicolons and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    let executed = 0
    for (const statement of statements) {
      try {
        await pool.query(statement)
        executed++
      } catch (err) {
        // Ignore "already exists" errors
        if (!err.message.includes('already exists') && !err.message.includes('duplicate')) {
          console.error('⚠️  Error executing statement:', err.message)
          console.error('Statement:', statement.substring(0, 100) + '...')
        }
      }
    }
    
    console.log(`✅ Executed ${executed} statements`)
    
    // Verify tables were created
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)
    
    console.log('\n📊 Created tables:')
    tables.rows.forEach(row => console.log(`   ✓ ${row.table_name}`))
    
    console.log('\n🎉 Database setup complete!')
    
    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    console.error(error.stack)
    await pool.end()
    process.exit(1)
  }
}

setupDatabase()

