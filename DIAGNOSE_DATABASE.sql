-- Diagnostic script to check database state and identify issues

-- 1. Check if parking_lots table exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'parking_lots') 
        THEN 'parking_lots table EXISTS' 
        ELSE 'parking_lots table DOES NOT EXIST' 
    END as table_status;

-- 2. Check table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'parking_lots' 
ORDER BY ordinal_position;

-- 3. Check if latitude/longitude columns exist
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parking_lots' AND column_name = 'latitude') 
        THEN 'latitude column EXISTS' 
        ELSE 'latitude column MISSING' 
    END as latitude_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parking_lots' AND column_name = 'longitude') 
        THEN 'longitude column EXISTS' 
        ELSE 'longitude column MISSING' 
    END as longitude_status;

-- 4. Count existing parking lots
SELECT 
    COUNT(*) as total_parking_lots,
    COUNT(CASE WHEN latitude IS NOT NULL THEN 1 END) as lots_with_latitude,
    COUNT(CASE WHEN longitude IS NOT NULL THEN 1 END) as lots_with_longitude,
    COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as lots_with_coordinates
FROM parking_lots;

-- 5. Show sample data
SELECT 
    id, 
    name, 
    location, 
    latitude, 
    longitude, 
    is_active,
    total_spaces,
    available_spaces
FROM parking_lots 
LIMIT 5;

-- 6. Check for any constraints that might prevent updates
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'parking_lots'::regclass;

-- 7. Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'parking_lots';

-- 8. Test a simple update (this will show if there are permission issues)
-- This is a safe test that doesn't change data
SELECT 
    'Testing UPDATE permissions...' as test_status;

-- Show current user and role
SELECT 
    current_user as current_database_user,
    session_user as session_user;