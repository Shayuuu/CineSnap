import { Pool, PoolClient } from 'pg'

let pool: Pool | null = null

function createPool() {
  if (!pool) {
    // Neon PostgreSQL connection string
    const databaseUrl = process.env.DATABASE_URL

    if (!databaseUrl) {
      console.error('❌ DATABASE_URL environment variable is not set!')
      console.error('📝 Please add DATABASE_URL to your .env.local file')
      console.error('📖 Get your connection string from Neon dashboard: https://console.neon.tech')
      console.error('💡 Format: postgresql://user:password@host/database?sslmode=require')
      console.error('💡 After adding, restart your dev server!')
      throw new Error('DATABASE_URL is not set. Please add Neon PostgreSQL connection string to .env.local and restart the server.')
    }

    // Parse connection string to show info (without password)
    try {
      const url = new URL(databaseUrl)
      console.log('📋 PostgreSQL Configuration:')
      console.log(`   Host: ${url.hostname}`)
      console.log(`   Database: ${url.pathname.slice(1)}`)
      console.log(`   User: ${url.username}`)
      console.log(`   SSL: Required`)
    } catch (e) {
      console.log('📋 Using DATABASE_URL connection string')
    }

    console.log('🔌 Connecting to Neon PostgreSQL...')

    pool = new Pool({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false // Required for Neon
      },
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    })

    // Test connection
    pool.query('SELECT NOW()')
      .then(() => {
        console.log('✅ PostgreSQL connection successful!')
      })
      .catch((err) => {
        console.error('❌ PostgreSQL connection test failed:', err.message)
        console.error('💡 Common fixes:')
        console.error('   1. Verify DATABASE_URL is correct')
        console.error('   2. Check Neon dashboard for connection string')
        console.error('   3. Ensure database exists in Neon')
        console.error('   4. Check network connectivity')
      })
  }
  return pool
}

export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  try {
    const pool = createPool()
    if (!pool) {
      throw new Error('Database pool is not initialized')
    }
    const result = await pool.query(sql, params || [])
    return result.rows as T[]
  } catch (error: any) {
    console.error('Database query error:', error?.message || error)
    console.error('SQL:', sql)
    console.error('Params:', params)
    throw error
  }
}

export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(sql, params)
  return rows[0] || null
}

export async function execute(sql: string, params?: any[]): Promise<any> {
  try {
    const pool = createPool()
    if (!pool) {
      throw new Error('Database pool is not initialized')
    }
    const result = await pool.query(sql, params || [])
    return result
  } catch (error: any) {
    console.error('Database execute error:', error?.message || error)
    console.error('SQL:', sql)
    console.error('Params:', params)
    throw error
  }
}

export async function getConnection(): Promise<PoolClient> {
  const pool = createPool()
  if (!pool) {
    throw new Error('Database pool is not initialized')
  }
  return await pool.connect()
}

export function getPool(): Pool {
  const pool = createPool()
  if (!pool) {
    throw new Error('Database pool is not initialized')
  }
  return pool
}
