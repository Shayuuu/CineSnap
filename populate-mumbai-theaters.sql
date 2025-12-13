-- =====================================================
-- Populate Mumbai Theaters, Screens, Seats & Showtimes
-- =====================================================
-- Run this script in Supabase SQL Editor after running supabase-complete-setup.sql
-- This script adds popular Mumbai theaters (PVR, INOX, etc.) with screens and seats
-- =====================================================

-- =====================================================
-- STEP 1: Insert Theaters (Mumbai)
-- =====================================================

-- PVR Cinemas
INSERT INTO "Theater" (id, name, location) VALUES
('theater_pvr_phoenix', 'PVR Cinemas - Phoenix Marketcity', 'Mumbai')
ON CONFLICT (id) DO NOTHING;

INSERT INTO "Theater" (id, name, location) VALUES
('theater_pvr_icon', 'PVR ICON - Infiniti Mall', 'Mumbai')
ON CONFLICT (id) DO NOTHING;

INSERT INTO "Theater" (id, name, location) VALUES
('theater_pvr_nexus', 'PVR Cinemas - Nexus Seawoods', 'Mumbai')
ON CONFLICT (id) DO NOTHING;

INSERT INTO "Theater" (id, name, location) VALUES
('theater_pvr_imax', 'PVR IMAX - Lower Parel', 'Mumbai')
ON CONFLICT (id) DO NOTHING;

-- INOX Cinemas
INSERT INTO "Theater" (id, name, location) VALUES
('theater_inox_rcity', 'INOX - R City Mall', 'Mumbai')
ON CONFLICT (id) DO NOTHING;

INSERT INTO "Theater" (id, name, location) VALUES
('theater_inox_ns', 'INOX - Nakshatra Mall', 'Mumbai')
ON CONFLICT (id) DO NOTHING;

INSERT INTO "Theater" (id, name, location) VALUES
('theater_inox_megaplex', 'INOX Megaplex - Inorbit Mall', 'Mumbai')
ON CONFLICT (id) DO NOTHING;

-- Cinepolis
INSERT INTO "Theater" (id, name, location) VALUES
('theater_cinepolis_airoli', 'Cinepolis - Seawoods Grand Central', 'Mumbai')
ON CONFLICT (id) DO NOTHING;

INSERT INTO "Theater" (id, name, location) VALUES
('theater_cinepolis_kurla', 'Cinepolis - R City Mall', 'Mumbai')
ON CONFLICT (id) DO NOTHING;

-- Carnival Cinemas
INSERT INTO "Theater" (id, name, location) VALUES
('theater_carnival_sm', 'Carnival Cinemas - Sion', 'Mumbai')
ON CONFLICT (id) DO NOTHING;

INSERT INTO "Theater" (id, name, location) VALUES
('theater_carnival_wadala', 'Carnival Cinemas - Wadala', 'Mumbai')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 2: Insert Screens for Each Theater
-- =====================================================

-- PVR Phoenix Marketcity (4 screens)
INSERT INTO "Screen" (id, name, "theaterId") VALUES
('screen_pvr_phoenix_1', 'Screen 1', 'theater_pvr_phoenix'),
('screen_pvr_phoenix_2', 'Screen 2', 'theater_pvr_phoenix'),
('screen_pvr_phoenix_3', 'Screen 3', 'theater_pvr_phoenix'),
('screen_pvr_phoenix_4', 'Screen 4', 'theater_pvr_phoenix')
ON CONFLICT (id) DO NOTHING;

-- PVR ICON Infiniti (3 screens)
INSERT INTO "Screen" (id, name, "theaterId") VALUES
('screen_pvr_icon_1', 'Screen 1', 'theater_pvr_icon'),
('screen_pvr_icon_2', 'Screen 2', 'theater_pvr_icon'),
('screen_pvr_icon_3', 'Screen 3', 'theater_pvr_icon')
ON CONFLICT (id) DO NOTHING;

-- PVR Nexus Seawoods (5 screens)
INSERT INTO "Screen" (id, name, "theaterId") VALUES
('screen_pvr_nexus_1', 'Screen 1', 'theater_pvr_nexus'),
('screen_pvr_nexus_2', 'Screen 2', 'theater_pvr_nexus'),
('screen_pvr_nexus_3', 'Screen 3', 'theater_pvr_nexus'),
('screen_pvr_nexus_4', 'Screen 4', 'theater_pvr_nexus'),
('screen_pvr_nexus_5', 'Screen 5', 'theater_pvr_nexus')
ON CONFLICT (id) DO NOTHING;

-- PVR IMAX Lower Parel (2 screens - IMAX and regular)
INSERT INTO "Screen" (id, name, "theaterId") VALUES
('screen_pvr_imax_1', 'IMAX Screen', 'theater_pvr_imax'),
('screen_pvr_imax_2', 'Screen 2', 'theater_pvr_imax')
ON CONFLICT (id) DO NOTHING;

-- INOX R City (4 screens)
INSERT INTO "Screen" (id, name, "theaterId") VALUES
('screen_inox_rcity_1', 'Screen 1', 'theater_inox_rcity'),
('screen_inox_rcity_2', 'Screen 2', 'theater_inox_rcity'),
('screen_inox_rcity_3', 'Screen 3', 'theater_inox_rcity'),
('screen_inox_rcity_4', 'Screen 4', 'theater_inox_rcity')
ON CONFLICT (id) DO NOTHING;

-- INOX Nakshatra (3 screens)
INSERT INTO "Screen" (id, name, "theaterId") VALUES
('screen_inox_ns_1', 'Screen 1', 'theater_inox_ns'),
('screen_inox_ns_2', 'Screen 2', 'theater_inox_ns'),
('screen_inox_ns_3', 'Screen 3', 'theater_inox_ns')
ON CONFLICT (id) DO NOTHING;

-- INOX Megaplex Inorbit (6 screens)
INSERT INTO "Screen" (id, name, "theaterId") VALUES
('screen_inox_mega_1', 'Screen 1', 'theater_inox_megaplex'),
('screen_inox_mega_2', 'Screen 2', 'theater_inox_megaplex'),
('screen_inox_mega_3', 'Screen 3', 'theater_inox_megaplex'),
('screen_inox_mega_4', 'Screen 4', 'theater_inox_megaplex'),
('screen_inox_mega_5', 'Screen 5', 'theater_inox_megaplex'),
('screen_inox_mega_6', 'Screen 6', 'theater_inox_megaplex')
ON CONFLICT (id) DO NOTHING;

-- Cinepolis Seawoods (4 screens)
INSERT INTO "Screen" (id, name, "theaterId") VALUES
('screen_cinepolis_airoli_1', 'Screen 1', 'theater_cinepolis_airoli'),
('screen_cinepolis_airoli_2', 'Screen 2', 'theater_cinepolis_airoli'),
('screen_cinepolis_airoli_3', 'Screen 3', 'theater_cinepolis_airoli'),
('screen_cinepolis_airoli_4', 'Screen 4', 'theater_cinepolis_airoli')
ON CONFLICT (id) DO NOTHING;

-- Cinepolis R City (3 screens)
INSERT INTO "Screen" (id, name, "theaterId") VALUES
('screen_cinepolis_kurla_1', 'Screen 1', 'theater_cinepolis_kurla'),
('screen_cinepolis_kurla_2', 'Screen 2', 'theater_cinepolis_kurla'),
('screen_cinepolis_kurla_3', 'Screen 3', 'theater_cinepolis_kurla')
ON CONFLICT (id) DO NOTHING;

-- Carnival Sion (2 screens)
INSERT INTO "Screen" (id, name, "theaterId") VALUES
('screen_carnival_sion_1', 'Screen 1', 'theater_carnival_sm'),
('screen_carnival_sion_2', 'Screen 2', 'theater_carnival_sm')
ON CONFLICT (id) DO NOTHING;

-- Carnival Wadala (2 screens)
INSERT INTO "Screen" (id, name, "theaterId") VALUES
('screen_carnival_wadala_1', 'Screen 1', 'theater_carnival_wadala'),
('screen_carnival_wadala_2', 'Screen 2', 'theater_carnival_wadala')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 3: Insert Seats for Each Screen
-- =====================================================
-- Each screen will have:
-- - Rows A-J: STANDARD seats (₹450-₹500)
-- - Rows K-M: PREMIUM seats (₹550-₹600)
-- - Rows N-P: VIP seats (₹650-₹750)
-- Each row has 20 seats (1-20)

-- Function to generate seats for a screen
DO $$
DECLARE
    screen_record RECORD;
    row_letter TEXT;
    seat_num INTEGER;
    seat_type_val TEXT;
    seat_id TEXT;
    row_num INTEGER;
BEGIN
    -- Loop through all screens
    FOR screen_record IN SELECT id, name FROM "Screen" LOOP
        -- Generate seats for each row
        FOR row_num IN 1..16 LOOP
            -- Convert row number to letter (1=A, 2=B, etc.)
            row_letter := CHR(64 + row_num); -- 64 is ASCII for '@', so 65='A'
            
            -- Determine seat type based on row
            IF row_num <= 10 THEN
                seat_type_val := 'STANDARD';
            ELSIF row_num <= 13 THEN
                seat_type_val := 'PREMIUM';
            ELSE
                seat_type_val := 'VIP';
            END IF;
            
            -- Generate 20 seats per row
            FOR seat_num IN 1..20 LOOP
                seat_id := 'seat_' || screen_record.id || '_' || row_letter || '_' || seat_num;
                
                INSERT INTO "Seat" (id, row, number, type, "screenId")
                VALUES (seat_id, row_letter, seat_num, seat_type_val::seat_type, screen_record.id)
                ON CONFLICT (id) DO NOTHING;
            END LOOP;
        END LOOP;
        
        RAISE NOTICE 'Generated seats for screen: %', screen_record.name;
    END LOOP;
END $$;

-- =====================================================
-- STEP 4: Optional - Insert Sample Showtimes
-- =====================================================
-- Note: Showtimes are usually generated dynamically based on movies
-- This is just a sample. You can delete this section if you want to generate showtimes programmatically.

-- Sample showtimes for today and next 7 days
-- Prices: STANDARD ₹450-₹500, PREMIUM ₹550-₹600, VIP ₹650-₹750
-- But since we're setting per-showtime, we'll use average prices:
-- STANDARD: ₹475, PREMIUM: ₹575, VIP: ₹700

-- Uncomment below if you want sample showtimes (replace 'movie_id_here' with actual movie IDs)

/*
DO $$
DECLARE
    screen_record RECORD;
    showtime_date DATE;
    time_slot TEXT;
    showtime_id TEXT;
    base_price INTEGER;
    movie_id TEXT := 'movie_id_here'; -- Replace with actual movie ID
    time_slots TEXT[] := ARRAY['10:00', '13:00', '16:00', '19:00', '22:00'];
BEGIN
    -- Generate showtimes for next 7 days
    FOR showtime_date IN SELECT generate_series(CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', '1 day'::interval)::DATE LOOP
        -- Loop through all screens
        FOR screen_record IN SELECT id FROM "Screen" LIMIT 10 LOOP
            -- Generate showtimes for each time slot
            FOREACH time_slot IN ARRAY time_slots LOOP
                showtime_id := 'showtime_' || screen_record.id || '_' || showtime_date || '_' || REPLACE(time_slot, ':', '');
                
                -- Base price varies by screen (premium theaters charge more)
                IF screen_record.id LIKE '%imax%' THEN
                    base_price := 60000; -- ₹600 for IMAX
                ELSIF screen_record.id LIKE '%pvr%' OR screen_record.id LIKE '%inox%' THEN
                    base_price := 50000; -- ₹500 for premium chains
                ELSE
                    base_price := 45000; -- ₹450 for others
                END IF;
                
                INSERT INTO "Showtime" (id, "movieId", "screenId", "startTime", price)
                VALUES (
                    showtime_id,
                    movie_id,
                    screen_record.id,
                    (showtime_date || ' ' || time_slot || ':00')::TIMESTAMP,
                    base_price
                )
                ON CONFLICT (id) DO NOTHING;
            END LOOP;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Generated sample showtimes';
END $$;
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check theaters
-- SELECT id, name, location FROM "Theater" WHERE location = 'Mumbai' ORDER BY name;

-- Check screens count per theater
-- SELECT t.name, COUNT(s.id) as screen_count
-- FROM "Theater" t
-- LEFT JOIN "Screen" s ON s."theaterId" = t.id
-- WHERE t.location = 'Mumbai'
-- GROUP BY t.id, t.name
-- ORDER BY t.name;

-- Check seats count per screen
-- SELECT s.name as screen_name, t.name as theater_name, COUNT(st.id) as seat_count
-- FROM "Screen" s
-- JOIN "Theater" t ON s."theaterId" = t.id
-- LEFT JOIN "Seat" st ON st."screenId" = s.id
-- WHERE t.location = 'Mumbai'
-- GROUP BY s.id, s.name, t.name
-- ORDER BY t.name, s.name;

-- Check total seats by type
-- SELECT type, COUNT(*) as count
-- FROM "Seat" s
-- JOIN "Screen" sc ON s."screenId" = sc.id
-- JOIN "Theater" t ON sc."theaterId" = t.id
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

