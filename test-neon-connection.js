// Test Neon PostgreSQL connection
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_rWQJG46OfCdw@ep-weathered-poetry-ad2sytyw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
})

async function testConnection() {
  try {
    console.log('🔌 Testing Neon PostgreSQL connection...')
    const result = await pool.query('SELECT NOW() as current_time, version() as pg_version')
    console.log('✅ Connection successful!')
    console.log('📅 Current time:', result.rows[0].current_time)
    console.log('🐘 PostgreSQL version:', result.rows[0].pg_version.split(' ')[0] + ' ' + result.rows[0].pg_version.split(' ')[1])
    
    // Check if tables exist
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)
    
    if (tables.rows.length > 0) {
      console.log('\n📊 Existing tables:')
      tables.rows.forEach(row => console.log(`   - ${row.table_name}`))
    } else {
      console.log('\n⚠️  No tables found. Run neon-schema.sql to create tables.')
    }
    
    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    process.exit(1)
  }
}

testConnection()

