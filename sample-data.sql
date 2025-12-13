-- Sample Data for BookMySeat
-- Run this in MySQL Workbench to populate your database with sample data

USE bookmyseat;

-- Insert Sample Movies (IGNORE will skip if already exists)
-- Using TMDB poster URLs (The Movie Database)
INSERT IGNORE INTO `Movie` (`id`, `title`, `posterUrl`, `duration`, `genre`, `releaseDate`) VALUES
('movie1', 'The Dark Knight', 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', 152, 'Action', '2024-01-15 00:00:00'),
('movie2', 'Inception', 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg', 148, 'Sci-Fi', '2024-02-01 00:00:00'),
('movie3', 'Interstellar', 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', 169, 'Sci-Fi', '2024-02-20 00:00:00'),
('movie4', 'The Matrix', 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', 136, 'Action', '2024-03-01 00:00:00'),
('movie5', 'Pulp Fiction', 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', 154, 'Crime', '2024-03-15 00:00:00');

-- Insert Sample Theaters (IGNORE will skip if already exists)
INSERT IGNORE INTO `Theater` (`id`, `name`, `location`) VALUES
('theater1', 'CineMax Downtown', '123 Main Street, Downtown'),
('theater2', 'MegaPlex Mall', '456 Shopping Mall, City Center'),
('theater3', 'Star Cinema', '789 Entertainment District');

-- Insert Sample Screens (IGNORE will skip if already exists)
INSERT IGNORE INTO `Screen` (`id`, `name`, `theaterId`) VALUES
('screen1', 'Screen 1', 'theater1'),
('screen2', 'Screen 2', 'theater1'),
('screen3', 'Screen 1', 'theater2'),
('screen4', 'Screen 2', 'theater2'),
('screen5', 'Screen 1', 'theater3');

-- Insert Sample Seats (IGNORE will skip if already exists)
-- Screen 1: 5 rows x 8 seats
INSERT IGNORE INTO `Seat` (`id`, `row`, `number`, `type`, `screenId`) VALUES
('seat1-A-1', 'A', 1, 'VIP', 'screen1'), ('seat1-A-2', 'A', 2, 'VIP', 'screen1'), ('seat1-A-3', 'A', 3, 'VIP', 'screen1'), ('seat1-A-4', 'A', 4, 'VIP', 'screen1'), ('seat1-A-5', 'A', 5, 'VIP', 'screen1'), ('seat1-A-6', 'A', 6, 'VIP', 'screen1'), ('seat1-A-7', 'A', 7, 'VIP', 'screen1'), ('seat1-A-8', 'A', 8, 'VIP', 'screen1'),
('seat1-B-1', 'B', 1, 'VIP', 'screen1'), ('seat1-B-2', 'B', 2, 'VIP', 'screen1'), ('seat1-B-3', 'B', 3, 'VIP', 'screen1'), ('seat1-B-4', 'B', 4, 'VIP', 'screen1'), ('seat1-B-5', 'B', 5, 'VIP', 'screen1'), ('seat1-B-6', 'B', 6, 'VIP', 'screen1'), ('seat1-B-7', 'B', 7, 'VIP', 'screen1'), ('seat1-B-8', 'B', 8, 'VIP', 'screen1'),
('seat1-C-1', 'C', 1, 'PREMIUM', 'screen1'), ('seat1-C-2', 'C', 2, 'PREMIUM', 'screen1'), ('seat1-C-3', 'C', 3, 'PREMIUM', 'screen1'), ('seat1-C-4', 'C', 4, 'PREMIUM', 'screen1'), ('seat1-C-5', 'C', 5, 'PREMIUM', 'screen1'), ('seat1-C-6', 'C', 6, 'PREMIUM', 'screen1'), ('seat1-C-7', 'C', 7, 'PREMIUM', 'screen1'), ('seat1-C-8', 'C', 8, 'PREMIUM', 'screen1'),
('seat1-D-1', 'D', 1, 'PREMIUM', 'screen1'), ('seat1-D-2', 'D', 2, 'PREMIUM', 'screen1'), ('seat1-D-3', 'D', 3, 'PREMIUM', 'screen1'), ('seat1-D-4', 'D', 4, 'PREMIUM', 'screen1'), ('seat1-D-5', 'D', 5, 'PREMIUM', 'screen1'), ('seat1-D-6', 'D', 6, 'PREMIUM', 'screen1'), ('seat1-D-7', 'D', 7, 'PREMIUM', 'screen1'), ('seat1-D-8', 'D', 8, 'PREMIUM', 'screen1'),
('seat1-E-1', 'E', 1, 'STANDARD', 'screen1'), ('seat1-E-2', 'E', 2, 'STANDARD', 'screen1'), ('seat1-E-3', 'E', 3, 'STANDARD', 'screen1'), ('seat1-E-4', 'E', 4, 'STANDARD', 'screen1'), ('seat1-E-5', 'E', 5, 'STANDARD', 'screen1'), ('seat1-E-6', 'E', 6, 'STANDARD', 'screen1'), ('seat1-E-7', 'E', 7, 'STANDARD', 'screen1'), ('seat1-E-8', 'E', 8, 'STANDARD', 'screen1');

-- Screen 2: 4 rows x 6 seats
INSERT IGNORE INTO `Seat` (`id`, `row`, `number`, `type`, `screenId`) VALUES
('seat2-A-1', 'A', 1, 'VIP', 'screen2'), ('seat2-A-2', 'A', 2, 'VIP', 'screen2'), ('seat2-A-3', 'A', 3, 'VIP', 'screen2'), ('seat2-A-4', 'A', 4, 'VIP', 'screen2'), ('seat2-A-5', 'A', 5, 'VIP', 'screen2'), ('seat2-A-6', 'A', 6, 'VIP', 'screen2'),
('seat2-B-1', 'B', 1, 'PREMIUM', 'screen2'), ('seat2-B-2', 'B', 2, 'PREMIUM', 'screen2'), ('seat2-B-3', 'B', 3, 'PREMIUM', 'screen2'), ('seat2-B-4', 'B', 4, 'PREMIUM', 'screen2'), ('seat2-B-5', 'B', 5, 'PREMIUM', 'screen2'), ('seat2-B-6', 'B', 6, 'PREMIUM', 'screen2'),
('seat2-C-1', 'C', 1, 'STANDARD', 'screen2'), ('seat2-C-2', 'C', 2, 'STANDARD', 'screen2'), ('seat2-C-3', 'C', 3, 'STANDARD', 'screen2'), ('seat2-C-4', 'C', 4, 'STANDARD', 'screen2'), ('seat2-C-5', 'C', 5, 'STANDARD', 'screen2'), ('seat2-C-6', 'C', 6, 'STANDARD', 'screen2'),
('seat2-D-1', 'D', 1, 'STANDARD', 'screen2'), ('seat2-D-2', 'D', 2, 'STANDARD', 'screen2'), ('seat2-D-3', 'D', 3, 'STANDARD', 'screen2'), ('seat2-D-4', 'D', 4, 'STANDARD', 'screen2'), ('seat2-D-5', 'D', 5, 'STANDARD', 'screen2'), ('seat2-D-6', 'D', 6, 'STANDARD', 'screen2');

-- Screen 3: 3 rows x 6 seats
INSERT IGNORE INTO `Seat` (`id`, `row`, `number`, `type`, `screenId`) VALUES
('seat3-A-1', 'A', 1, 'PREMIUM', 'screen3'), ('seat3-A-2', 'A', 2, 'PREMIUM', 'screen3'), ('seat3-A-3', 'A', 3, 'PREMIUM', 'screen3'), ('seat3-A-4', 'A', 4, 'PREMIUM', 'screen3'), ('seat3-A-5', 'A', 5, 'PREMIUM', 'screen3'), ('seat3-A-6', 'A', 6, 'PREMIUM', 'screen3'),
('seat3-B-1', 'B', 1, 'STANDARD', 'screen3'), ('seat3-B-2', 'B', 2, 'STANDARD', 'screen3'), ('seat3-B-3', 'B', 3, 'STANDARD', 'screen3'), ('seat3-B-4', 'B', 4, 'STANDARD', 'screen3'), ('seat3-B-5', 'B', 5, 'STANDARD', 'screen3'), ('seat3-B-6', 'B', 6, 'STANDARD', 'screen3'),
('seat3-C-1', 'C', 1, 'STANDARD', 'screen3'), ('seat3-C-2', 'C', 2, 'STANDARD', 'screen3'), ('seat3-C-3', 'C', 3, 'STANDARD', 'screen3'), ('seat3-C-4', 'C', 4, 'STANDARD', 'screen3'), ('seat3-C-5', 'C', 5, 'STANDARD', 'screen3'), ('seat3-C-6', 'C', 6, 'STANDARD', 'screen3');

-- Insert Sample Showtimes (for today and next few days) (IGNORE will skip if already exists)
INSERT IGNORE INTO `Showtime` (`id`, `movieId`, `screenId`, `startTime`, `price`) VALUES
-- Today's showtimes
('show1', 'movie1', 'screen1', DATE_ADD(NOW(), INTERVAL 2 HOUR), 50000),  -- ₹500
('show2', 'movie2', 'screen2', DATE_ADD(NOW(), INTERVAL 4 HOUR), 45000),  -- ₹450
('show3', 'movie1', 'screen3', DATE_ADD(NOW(), INTERVAL 6 HOUR), 50000),
('show4', 'movie3', 'screen1', DATE_ADD(NOW(), INTERVAL 8 HOUR), 55000),  -- ₹550
-- Tomorrow's showtimes (using nested DATE_ADD)
('show5', 'movie2', 'screen2', DATE_ADD(DATE_ADD(NOW(), INTERVAL 1 DAY), INTERVAL 2 HOUR), 45000),
('show6', 'movie4', 'screen3', DATE_ADD(DATE_ADD(NOW(), INTERVAL 1 DAY), INTERVAL 4 HOUR), 48000),
('show7', 'movie5', 'screen1', DATE_ADD(DATE_ADD(NOW(), INTERVAL 1 DAY), INTERVAL 6 HOUR), 42000);

