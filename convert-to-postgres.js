// Script to help convert MySQL queries to PostgreSQL
// This is a reference guide - actual conversion needs to be done manually

const conversions = {
  // Placeholders
  '?': '$1, $2, $3...',
  
  // Table names - quote them
  'FROM User': 'FROM "User"',
  'FROM Booking': 'FROM "Booking"',
  'FROM Showtime': 'FROM "Showtime"',
  'FROM Movie': 'FROM "Movie"',
  'FROM Theater': 'FROM "Theater"',
  'FROM Screen': 'FROM "Screen"',
  'FROM Seat': 'FROM "Seat"',
  'FROM FoodItem': 'FROM "FoodItem"',
  'FROM LoyaltyPoints': 'FROM "LoyaltyPoints"',
  'FROM UserWallet': 'FROM "UserWallet"',
  'FROM BookingGroup': 'FROM "BookingGroup"',
  'FROM GroupMember': 'FROM "GroupMember"',
  'FROM Review': 'FROM "Review"',
  'FROM _BookingSeats': 'FROM "_BookingSeats"',
  
  // Column names - quote them
  'userId': '"userId"',
  'showtimeId': '"showtimeId"',
  'movieId': '"movieId"',
  'theaterId': '"theaterId"',
  'screenId': '"screenId"',
  'seatId': '"seatId"',
  'totalAmount': '"totalAmount"',
  'createdAt': '"createdAt"',
  'updatedAt': '"updatedAt"',
  'startTime': '"startTime"',
  'posterUrl': '"posterUrl"',
  'releaseDate': '"releaseDate"',
  'razorpayOrderId': '"razorpayOrderId"',
  'loyaltyPointsEarned': '"loyaltyPointsEarned"',
  
  // Upserts
  'ON DUPLICATE KEY UPDATE': 'ON CONFLICT (id) DO UPDATE',
  
  // Transactions
  'connection.beginTransaction()': "client.query('BEGIN')",
  'connection.commit()': "client.query('COMMIT')",
  'connection.rollback()': "client.query('ROLLBACK')",
  'connection.execute(': 'client.query(',
  'connection.query(': 'client.query(',
  
  // Result handling
  'const [rows] = await': 'const result = await',
  'rows': 'result.rows',
  
  // Backticks
  '`row`': '"row"',
  '`number`': '"number"',
  'CONCAT(`row`, `number`)': 'CONCAT("row", "number")',
};

console.log('PostgreSQL Conversion Guide:');
console.log(JSON.stringify(conversions, null, 2));

