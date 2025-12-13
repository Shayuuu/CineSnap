-- =====================================================
-- Generate Showtimes for All Movies
-- =====================================================
-- This script generates showtimes for all movies in the database
-- Run this after movies are added from TMDb API
-- =====================================================

DO $$
DECLARE
    movie_record RECORD;
    screen_record RECORD;
    showtime_date DATE;
    time_slot TEXT;
    showtime_id TEXT;
    base_price INTEGER;
    time_slots TEXT[] := ARRAY['10:00', '13:00', '16:00', '19:00', '22:00'];
    days_ahead INTEGER := 7; -- Generate showtimes for next 7 days
BEGIN
    -- Loop through all movies
    FOR movie_record IN SELECT id, title, duration FROM "Movie" LOOP
        RAISE NOTICE 'Generating showtimes for movie: %', movie_record.title;
        
        -- Generate showtimes for next N days
        FOR showtime_date IN SELECT generate_series(
            CURRENT_DATE, 
            CURRENT_DATE + (days_ahead || ' days')::INTERVAL, 
            '1 day'::interval
        )::DATE LOOP
            
            -- Loop through all screens
            FOR screen_record IN SELECT id, name FROM "Screen" LOOP
                -- Generate showtimes for each time slot
                FOREACH time_slot IN ARRAY time_slots LOOP
                    -- Create unique showtime ID
                    showtime_id := 'showtime_' || 
                        SUBSTRING(movie_record.id, 1, 10) || '_' || 
                        screen_record.id || '_' || 
                        TO_CHAR(showtime_date, 'YYYYMMDD') || '_' || 
                        REPLACE(time_slot, ':', '');
                    
                    -- Determine base price based on theater chain
                    -- Check if screen belongs to premium theater
                    IF EXISTS (
                        SELECT 1 FROM "Screen" s
                        JOIN "Theater" t ON s."theaterId" = t.id
                        WHERE s.id = screen_record.id
                        AND (t.name LIKE '%PVR%' OR t.name LIKE '%INOX%' OR t.name LIKE '%IMAX%')
                    ) THEN
                        -- Premium theaters: ₹500-₹600
                        base_price := 50000 + (RANDOM() * 10000)::INTEGER;
                    ELSE
                        -- Regular theaters: ₹450-₹500
                        base_price := 45000 + (RANDOM() * 5000)::INTEGER;
                    END IF;
                    
                    -- Insert showtime (skip if already exists)
                    INSERT INTO "Showtime" (id, "movieId", "screenId", "startTime", price)
                    VALUES (
                        showtime_id,
                        movie_record.id,
                        screen_record.id,
                        (showtime_date || ' ' || time_slot || ':00')::TIMESTAMP,
                        base_price
                    )
                    ON CONFLICT (id) DO NOTHING;
                END LOOP;
            END LOOP;
        END LOOP;
        
        RAISE NOTICE 'Completed showtimes for movie: %', movie_record.title;
    END LOOP;
    
    RAISE NOTICE 'Showtime generation completed!';
END $$;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check showtimes count per movie
-- SELECT m.title, COUNT(s.id) as showtime_count
-- FROM "Movie" m
-- LEFT JOIN "Showtime" s ON s."movieId" = m.id
-- GROUP BY m.id, m.title
-- ORDER BY showtime_count DESC;

-- Check showtimes for today
-- SELECT 
--     m.title,
--     t.name as theater,
--     sc.name as screen,
--     s."startTime",
--     s.price / 100.0 as price_rupees
-- FROM "Showtime" s
-- JOIN "Movie" m ON s."movieId" = m.id
-- JOIN "Screen" sc ON s."screenId" = sc.id
-- JOIN "Theater" t ON sc."theaterId" = t.id
-- WHERE DATE(s."startTime") = CURRENT_DATE
-- ORDER BY s."startTime";

