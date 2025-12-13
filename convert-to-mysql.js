// Quick reference script for MySQL conversion
// This file shows the conversion patterns - actual conversion done manually

/*
PostgreSQL -> MySQL Conversion Patterns:

1. Table names: "User" -> User
2. Column names: "userId" -> userId
3. Placeholders: $1, $2 -> ?
4. CURRENT_TIMESTAMP -> NOW()
5. ON CONFLICT DO NOTHING -> ON DUPLICATE KEY UPDATE id=id
6. Transactions:
   - PostgreSQL: client.query('BEGIN'), client.query('COMMIT')
   - MySQL: connection.beginTransaction(), connection.commit()
7. Result access:
   - PostgreSQL: result.rows
   - MySQL: [rows] = await connection.execute()
*/

console.log('See MYSQL_CONVERSION_GUIDE.md for detailed conversion steps')

