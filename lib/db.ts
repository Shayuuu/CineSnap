import mysql from 'mysql2/promise'

let pool: mysql.Pool | null = null

function getPool() {
  if (!pool) {
    let host: string
    let port: number
    let user: string
    let password: string
    let database: string

    // Check for DATABASE_URL first
    const url = process.env.DATABASE_URL
    if (url) {
      // Parse MySQL connection string: mysql://user:pass@host:port/dbname
      const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)
      if (!match) throw new Error('Invalid DATABASE_URL format')
      const [, dbUser, dbPassword, dbHost, dbPort, dbName] = match
      user = dbUser
      password = dbPassword
      host = dbHost
      port = parseInt(dbPort)
      database = dbName
    } else {
      // Fall back to individual environment variables
      host = process.env.DB_HOST || 'localhost'
      port = parseInt(process.env.DB_PORT || '3306')
      user = process.env.DB_USER || 'root'
      password = process.env.DB_PASSWORD || ''
      database = process.env.DB_NAME || 'bookmyseat'

      if (!database) throw new Error('DB_NAME is not set')
    }

    pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    })
  }
  return pool
}

export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  try {
    const pool = getPool()
    const [rows] = await pool.execute(sql, params)
    return rows as T[]
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
    const pool = getPool()
    const [result] = await pool.execute(sql, params)
    return result
  } catch (error: any) {
    console.error('Database execute error:', error?.message || error)
    console.error('SQL:', sql)
    console.error('Params:', params)
    throw error
  }
}

export { getPool }

