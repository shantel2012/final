-- Check if parking_lots table exists and view its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'parking_lots' 
ORDER BY ordinal_position;

-- Check if latitude and longitude columns exist
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'parking_lots' 
    AND column_name = 'latitude'
) as latitude_exists,
EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'parking_lots' 
    AND column_name = 'longitude'
) as longitude_exists;

-- Check current data in parking_lots table
SELECT id, name, location, latitude, longitude, is_active 
FROM parking_lots 
LIMIT 5;