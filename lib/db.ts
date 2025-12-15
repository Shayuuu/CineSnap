import mysql from 'mysql2/promise'

// Check if showcase mode is enabled
const IS_SHOWCASE_MODE = process.env.SHOWCASE_MODE === 'true' || !process.env.DB_HOST

let pool: mysql.Pool | null = null

function createPool() {
  if (!pool) {
    // MySQL connection configuration
    const dbHost = process.env.DB_HOST || 'localhost'
    const dbPort = parseInt(process.env.DB_PORT || '3306', 10)
    const dbUser = process.env.DB_USER || 'root'
    const dbPassword = process.env.DB_PASSWORD || ''
    const dbName = process.env.DB_NAME || 'bookmyseat'

    // Debug: Show what environment variables are being read (without exposing password)
    console.log('📋 MySQL Configuration:')
    console.log(`   DB_HOST: ${dbHost}`)
    console.log(`   DB_PORT: ${dbPort}`)
    console.log(`   DB_USER: ${dbUser}`)
    console.log(`   DB_PASSWORD: ${dbPassword ? '***SET***' : '❌ NOT SET'}`)
    console.log(`   DB_NAME: ${dbName}`)

    if (!dbPassword && !IS_SHOWCASE_MODE) {
      console.error('⚠️  DB_PASSWORD is not set!')
      console.error('📝 Please add MySQL connection variables to your .env.local file.')
      console.error('📖 Required variables:')
      console.error('   DB_HOST=localhost')
      console.error('   DB_PORT=3306')
      console.error('   DB_USER=root')
      console.error('   DB_PASSWORD=your_mysql_password')
      console.error('   DB_NAME=bookmyseat')
      console.error('')
      console.error('💡 Or set SHOWCASE_MODE=true to use mock data (no database needed)')
      console.error('💡 After adding variables, restart your dev server!')
      throw new Error('DB_PASSWORD is not set. Please add MySQL connection variables to .env.local and restart the server.')
    }

    if (!dbHost && !IS_SHOWCASE_MODE) {
      console.error('⚠️  DB_HOST is not set!')
      console.error('📝 Please add MySQL connection variables to your .env.local file.')
      console.error('📖 Required: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME')
      console.error('💡 Or set SHOWCASE_MODE=true to use mock data (no database needed)')
      throw new Error('DB_HOST is not set. Please set your MySQL connection variables in .env.local file.')
    }

    if (IS_SHOWCASE_MODE) {
      console.log('🎭 Showcase Mode: Using mock data (no database connection needed)')
      return null as any // Return null, but functions will use mock data
    }

    console.log(`🔌 Connecting to MySQL: ${dbUser}@${dbHost}:${dbPort}/${dbName}`)

    pool = mysql.createPool({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      // Enable SSL for production cloud databases
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
      } : undefined
    })

    // Test connection
    pool.query('SELECT 1')
      .then(() => {
        console.log('✅ MySQL connection successful!')
      })
      .catch((err) => {
        console.error('❌ MySQL connection test failed:', err.message)
        console.error('💡 Common fixes:')
        console.error('   1. Verify MySQL server is running')
        console.error('   2. Check DB_HOST, DB_USER, DB_PASSWORD, DB_NAME in .env.local')
        console.error('   3. Ensure database exists')
        console.error('   4. Check MySQL user permissions')
      })
  }
  return pool
}

export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  // Use mock database in showcase mode
  if (IS_SHOWCASE_MODE) {
    const { query: mockQuery } = await import('./mockDb')
    return mockQuery<T>(sql, params)
  }

  try {
    const pool = createPool()
    if (!pool) {
      throw new Error('Database pool is not initialized')
    }
    const [rows] = await pool.execute(sql, params || [])
    return rows as T[]
  } catch (error: any) {
    console.error('Database query error:', error?.message || error)
    console.error('SQL:', sql)
    console.error('Params:', params)
    throw error
  }
}

export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  // Use mock database in showcase mode
  if (IS_SHOWCASE_MODE) {
    const { queryOne: mockQueryOne } = await import('./mockDb')
    return mockQueryOne<T>(sql, params)
  }

  const rows = await query<T>(sql, params)
  return rows[0] || null
}

export async function execute(sql: string, params?: any[]): Promise<any> {
  // Use mock database in showcase mode
  if (IS_SHOWCASE_MODE) {
    const { execute: mockExecute } = await import('./mockDb')
    return mockExecute(sql, params)
  }

  try {
    const pool = createPool()
    if (!pool) {
      throw new Error('Database pool is not initialized')
    }
    const [result] = await pool.execute(sql, params || [])
    return result
  } catch (error: any) {
    console.error('Database execute error:', error?.message || error)
    console.error('SQL:', sql)
    console.error('Params:', params)
    throw error
  }
}

export async function getConnection(): Promise<mysql.PoolConnection> {
  if (IS_SHOWCASE_MODE) {
    // Return a mock connection object for showcase mode
    // Transactions aren't needed in showcase mode, but we need to return something
    return {
      query: async () => [[], []],
      execute: async () => [[], []],
      beginTransaction: async () => {},
      commit: async () => {},
      rollback: async () => {},
      release: async () => {},
    } as any
  }
  
  const pool = createPool()
  if (!pool) {
    throw new Error('Database pool is not initialized')
  }
  return await pool.getConnection()
}

export function getPool(): mysql.Pool {
  if (IS_SHOWCASE_MODE) {
    // Return a mock pool object for showcase mode
    return {
      getConnection: async () => ({
        query: async () => [[], []],
        execute: async () => [[], []],
        beginTransaction: async () => {},
        commit: async () => {},
        rollback: async () => {},
        release: async () => {},
      }),
      query: async () => [[], []],
      execute: async () => [[], []],
    } as any
  }
  
  const pool = createPool()
  if (!pool) {
    throw new Error('Database pool is not initialized')
  }
  return pool
}
