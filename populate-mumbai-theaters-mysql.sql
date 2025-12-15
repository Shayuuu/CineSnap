-- =====================================================
-- Populate Mumbai Theaters, Screens, Seats & Showtimes (MySQL)
-- =====================================================
-- Run this script in MySQL Workbench after running mysql-complete-setup.sql
-- This script adds popular Mumbai theaters (PVR, INOX, etc.) with screens and seats
-- =====================================================

USE bookmyseat;

-- =====================================================
-- STEP 1: Insert Theaters (Mumbai)
-- =====================================================

-- PVR Cinemas
INSERT INTO Theater (id, name, location) VALUES
('theater_pvr_phoenix', 'PVR Cinemas - Phoenix Marketcity', 'Mumbai'),
('theater_pvr_icon', 'PVR ICON - Infiniti Mall', 'Mumbai'),
('theater_pvr_nexus', 'PVR Cinemas - Nexus Seawoods', 'Mumbai'),
('theater_pvr_imax', 'PVR IMAX - Lower Parel', 'Mumbai')
ON DUPLICATE KEY UPDATE id=id;

-- INOX Cinemas
INSERT INTO Theater (id, name, location) VALUES
('theater_inox_rcity', 'INOX - R City Mall', 'Mumbai'),
('theater_inox_ns', 'INOX - Nakshatra Mall', 'Mumbai'),
('theater_inox_megaplex', 'INOX Megaplex - Inorbit Mall', 'Mumbai')
ON DUPLICATE KEY UPDATE id=id;

-- Cinepolis
INSERT INTO Theater (id, name, location) VALUES
('theater_cinepolis_airoli', 'Cinepolis - Seawoods Grand Central', 'Mumbai'),
('theater_cinepolis_kurla', 'Cinepolis - R City Mall', 'Mumbai')
ON DUPLICATE KEY UPDATE id=id;

-- Carnival Cinemas
INSERT INTO Theater (id, name, location) VALUES
('theater_carnival_sm', 'Carnival Cinemas - Sion', 'Mumbai'),
('theater_carnival_wadala', 'Carnival Cinemas - Wadala', 'Mumbai')
ON DUPLICATE KEY UPDATE id=id;

-- =====================================================
-- STEP 2: Insert Screens for Each Theater
-- =====================================================

-- PVR Phoenix Marketcity (4 screens)
INSERT INTO Screen (id, name, theaterId) VALUES
('screen_pvr_phoenix_1', 'Screen 1', 'theater_pvr_phoenix'),
('screen_pvr_phoenix_2', 'Screen 2', 'theater_pvr_phoenix'),
('screen_pvr_phoenix_3', 'Screen 3', 'theater_pvr_phoenix'),
('screen_pvr_phoenix_4', 'Screen 4', 'theater_pvr_phoenix')
ON DUPLICATE KEY UPDATE id=id;

-- PVR ICON Infiniti (3 screens)
INSERT INTO Screen (id, name, theaterId) VALUES
('screen_pvr_icon_1', 'Screen 1', 'theater_pvr_icon'),
('screen_pvr_icon_2', 'Screen 2', 'theater_pvr_icon'),
('screen_pvr_icon_3', 'Screen 3', 'theater_pvr_icon')
ON DUPLICATE KEY UPDATE id=id;

-- PVR Nexus Seawoods (5 screens)
INSERT INTO Screen (id, name, theaterId) VALUES
('screen_pvr_nexus_1', 'Screen 1', 'theater_pvr_nexus'),
('screen_pvr_nexus_2', 'Screen 2', 'theater_pvr_nexus'),
('screen_pvr_nexus_3', 'Screen 3', 'theater_pvr_nexus'),
('screen_pvr_nexus_4', 'Screen 4', 'theater_pvr_nexus'),
('screen_pvr_nexus_5', 'Screen 5', 'theater_pvr_nexus')
ON DUPLICATE KEY UPDATE id=id;

-- PVR IMAX Lower Parel (2 screens - IMAX and regular)
INSERT INTO Screen (id, name, theaterId) VALUES
('screen_pvr_imax_1', 'IMAX Screen', 'theater_pvr_imax'),
('screen_pvr_imax_2', 'Screen 2', 'theater_pvr_imax')
ON DUPLICATE KEY UPDATE id=id;

-- INOX R City (4 screens)
INSERT INTO Screen (id, name, theaterId) VALUES
('screen_inox_rcity_1', 'Screen 1', 'theater_inox_rcity'),
('screen_inox_rcity_2', 'Screen 2', 'theater_inox_rcity'),
('screen_inox_rcity_3', 'Screen 3', 'theater_inox_rcity'),
('screen_inox_rcity_4', 'Screen 4', 'theater_inox_rcity')
ON DUPLICATE KEY UPDATE id=id;

-- INOX Nakshatra (3 screens)
INSERT INTO Screen (id, name, theaterId) VALUES
('screen_inox_ns_1', 'Screen 1', 'theater_inox_ns'),
('screen_inox_ns_2', 'Screen 2', 'theater_inox_ns'),
('screen_inox_ns_3', 'Screen 3', 'theater_inox_ns')
ON DUPLICATE KEY UPDATE id=id;

-- INOX Megaplex Inorbit (6 screens)
INSERT INTO Screen (id, name, theaterId) VALUES
('screen_inox_mega_1', 'Screen 1', 'theater_inox_megaplex'),
('screen_inox_mega_2', 'Screen 2', 'theater_inox_megaplex'),
('screen_inox_mega_3', 'Screen 3', 'theater_inox_megaplex'),
('screen_inox_mega_4', 'Screen 4', 'theater_inox_megaplex'),
('screen_inox_mega_5', 'Screen 5', 'theater_inox_megaplex'),
('screen_inox_mega_6', 'Screen 6', 'theater_inox_megaplex')
ON DUPLICATE KEY UPDATE id=id;

-- Cinepolis Seawoods (4 screens)
INSERT INTO Screen (id, name, theaterId) VALUES
('screen_cinepolis_airoli_1', 'Screen 1', 'theater_cinepolis_airoli'),
('screen_cinepolis_airoli_2', 'Screen 2', 'theater_cinepolis_airoli'),
('screen_cinepolis_airoli_3', 'Screen 3', 'theater_cinepolis_airoli'),
('screen_cinepolis_airoli_4', 'Screen 4', 'theater_cinepolis_airoli')
ON DUPLICATE KEY UPDATE id=id;

-- Cinepolis R City (3 screens)
INSERT INTO Screen (id, name, theaterId) VALUES
('screen_cinepolis_kurla_1', 'Screen 1', 'theater_cinepolis_kurla'),
('screen_cinepolis_kurla_2', 'Screen 2', 'theater_cinepolis_kurla'),
('screen_cinepolis_kurla_3', 'Screen 3', 'theater_cinepolis_kurla')
ON DUPLICATE KEY UPDATE id=id;

-- Carnival Sion (2 screens)
INSERT INTO Screen (id, name, theaterId) VALUES
('screen_carnival_sion_1', 'Screen 1', 'theater_carnival_sm'),
('screen_carnival_sion_2', 'Screen 2', 'theater_carnival_sm')
ON DUPLICATE KEY UPDATE id=id;

-- Carnival Wadala (2 screens)
INSERT INTO Screen (id, name, theaterId) VALUES
('screen_carnival_wadala_1', 'Screen 1', 'theater_carnival_wadala'),
('screen_carnival_wadala_2', 'Screen 2', 'theater_carnival_wadala')
ON DUPLICATE KEY UPDATE id=id;

-- =====================================================
-- STEP 3: Insert Seats for Each Screen
-- =====================================================
-- Each screen will have:
-- - Rows A-J: STANDARD seats (₹450-₹500)
-- - Rows K-M: PREMIUM seats (₹550-₹600)
-- - Rows N-P: VIP seats (₹650-₹750)
-- Each row has 20 seats (1-20)

-- Generate seats for all screens
DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS GenerateSeatsForScreen(
    IN screen_id VARCHAR(191),
    IN screen_name VARCHAR(191)
)
BEGIN
    DECLARE row_letter CHAR(1);
    DECLARE seat_num INT;
    DECLARE seat_type_val VARCHAR(20);
    DECLARE seat_id VARCHAR(191);
    DECLARE row_num INT;
    
    SET row_num = 1;
    
    -- Generate seats for rows A-P (16 rows)
    WHILE row_num <= 16 DO
        -- Convert row number to letter (1=A, 2=B, etc.)
        SET row_letter = CHAR(64 + row_num); -- 64 is ASCII for '@', so 65='A'
        
        -- Determine seat type based on row
        IF row_num <= 10 THEN
            SET seat_type_val = 'STANDARD';
        ELSEIF row_num <= 13 THEN
            SET seat_type_val = 'PREMIUM';
        ELSE
            SET seat_type_val = 'VIP';
        END IF;
        
        -- Generate 20 seats per row
        SET seat_num = 1;
        WHILE seat_num <= 20 DO
            SET seat_id = CONCAT('seat_', screen_id, '_', row_letter, '_', seat_num);
            
            INSERT INTO Seat (id, row, number, type, screenId)
            VALUES (seat_id, row_letter, seat_num, seat_type_val, screen_id)
            ON DUPLICATE KEY UPDATE id=id;
            
            SET seat_num = seat_num + 1;
        END WHILE;
        
        SET row_num = row_num + 1;
    END WHILE;
    
    SELECT CONCAT('Generated seats for screen: ', screen_name) AS message;
END$$

DELIMITER ;

-- Generate seats for all screens
CALL GenerateSeatsForScreen('screen_pvr_phoenix_1', 'PVR Phoenix Screen 1');
CALL GenerateSeatsForScreen('screen_pvr_phoenix_2', 'PVR Phoenix Screen 2');
CALL GenerateSeatsForScreen('screen_pvr_phoenix_3', 'PVR Phoenix Screen 3');
CALL GenerateSeatsForScreen('screen_pvr_phoenix_4', 'PVR Phoenix Screen 4');
CALL GenerateSeatsForScreen('screen_pvr_icon_1', 'PVR ICON Screen 1');
CALL GenerateSeatsForScreen('screen_pvr_icon_2', 'PVR ICON Screen 2');
CALL GenerateSeatsForScreen('screen_pvr_icon_3', 'PVR ICON Screen 3');
CALL GenerateSeatsForScreen('screen_pvr_nexus_1', 'PVR Nexus Screen 1');
CALL GenerateSeatsForScreen('screen_pvr_nexus_2', 'PVR Nexus Screen 2');
CALL GenerateSeatsForScreen('screen_pvr_nexus_3', 'PVR Nexus Screen 3');
CALL GenerateSeatsForScreen('screen_pvr_nexus_4', 'PVR Nexus Screen 4');
CALL GenerateSeatsForScreen('screen_pvr_nexus_5', 'PVR Nexus Screen 5');
CALL GenerateSeatsForScreen('screen_pvr_imax_1', 'PVR IMAX Screen');
CALL GenerateSeatsForScreen('screen_pvr_imax_2', 'PVR IMAX Screen 2');
CALL GenerateSeatsForScreen('screen_inox_rcity_1', 'INOX R City Screen 1');
CALL GenerateSeatsForScreen('screen_inox_rcity_2', 'INOX R City Screen 2');
CALL GenerateSeatsForScreen('screen_inox_rcity_3', 'INOX R City Screen 3');
CALL GenerateSeatsForScreen('screen_inox_rcity_4', 'INOX R City Screen 4');
CALL GenerateSeatsForScreen('screen_inox_ns_1', 'INOX Nakshatra Screen 1');
CALL GenerateSeatsForScreen('screen_inox_ns_2', 'INOX Nakshatra Screen 2');
CALL GenerateSeatsForScreen('screen_inox_ns_3', 'INOX Nakshatra Screen 3');
CALL GenerateSeatsForScreen('screen_inox_mega_1', 'INOX Megaplex Screen 1');
CALL GenerateSeatsForScreen('screen_inox_mega_2', 'INOX Megaplex Screen 2');
CALL GenerateSeatsForScreen('screen_inox_mega_3', 'INOX Megaplex Screen 3');
CALL GenerateSeatsForScreen('screen_inox_mega_4', 'INOX Megaplex Screen 4');
CALL GenerateSeatsForScreen('screen_inox_mega_5', 'INOX Megaplex Screen 5');
CALL GenerateSeatsForScreen('screen_inox_mega_6', 'INOX Megaplex Screen 6');
CALL GenerateSeatsForScreen('screen_cinepolis_airoli_1', 'Cinepolis Seawoods Screen 1');
CALL GenerateSeatsForScreen('screen_cinepolis_airoli_2', 'Cinepolis Seawoods Screen 2');
CALL GenerateSeatsForScreen('screen_cinepolis_airoli_3', 'Cinepolis Seawoods Screen 3');
CALL GenerateSeatsForScreen('screen_cinepolis_airoli_4', 'Cinepolis Seawoods Screen 4');
CALL GenerateSeatsForScreen('screen_cinepolis_kurla_1', 'Cinepolis R City Screen 1');
CALL GenerateSeatsForScreen('screen_cinepolis_kurla_2', 'Cinepolis R City Screen 2');
CALL GenerateSeatsForScreen('screen_cinepolis_kurla_3', 'Cinepolis R City Screen 3');
CALL GenerateSeatsForScreen('screen_carnival_sion_1', 'Carnival Sion Screen 1');
CALL GenerateSeatsForScreen('screen_carnival_sion_2', 'Carnival Sion Screen 2');
CALL GenerateSeatsForScreen('screen_carnival_wadala_1', 'Carnival Wadala Screen 1');
CALL GenerateSeatsForScreen('screen_carnival_wadala_2', 'Carnival Wadala Screen 2');

-- Drop the procedure after use
DROP PROCEDURE IF EXISTS GenerateSeatsForScreen;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check theaters
-- SELECT id, name, location FROM Theater WHERE location = 'Mumbai' ORDER BY name;

-- Check screens count per theater
-- SELECT t.name, COUNT(s.id) as screen_count
-- FROM Theater t
-- LEFT JOIN Screen s ON s.theaterId = t.id
-- WHERE t.location = 'Mumbai'
-- GROUP BY t.id, t.name
-- ORDER BY t.name;

-- Check seats count per screen
-- SELECT s.name as screen_name, t.name as theater_name, COUNT(st.id) as seat_count
-- FROM Screen s
-- JOIN Theater t ON s.theaterId = t.id
-- LEFT JOIN Seat st ON st.screenId = s.id
-- WHERE t.location = 'Mumbai'
-- GROUP BY s.id, s.name, t.name
-- ORDER BY t.name, s.name;

-- Check total seats by type
-- SELECT type, COUNT(*) as count
-- FROM Seat s
-- JOIN Screen sc ON s.screenId = sc.id
-- JOIN Theater t ON sc.theaterId = t.id
-- WHERE t.location = 'Mumbai'
-- GROUP BY type;

-- =====================================================
-- SUMMARY
-- =====================================================
-- After running this script, you should have:
-- - 11 theaters in Mumbai
-- - ~40 screens across all theaters
-- - ~12,800 seats (40 screens × 16 rows × 20 seats)
-- - Showtimes will be generated dynamically when movies are added
-- =====================================================


