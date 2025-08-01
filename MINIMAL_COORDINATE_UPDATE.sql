-- Minimal coordinate update script
-- Run this step by step to identify and fix issues

-- Step 1: Check if we can select from the table
SELECT 'Step 1: Testing SELECT access...' as step;
SELECT COUNT(*) as parking_lot_count FROM parking_lots;

-- Step 2: Check current coordinate status
SELECT 'Step 2: Checking coordinate status...' as step;
SELECT 
    name,
    location,
    latitude,
    longitude,
    CASE 
        WHEN latitude IS NULL OR longitude IS NULL THEN 'NEEDS COORDINATES'
        ELSE 'HAS COORDINATES'
    END as coordinate_status
FROM parking_lots
ORDER BY name;

-- Step 3: Try a simple update on one record first
SELECT 'Step 3: Testing UPDATE on one record...' as step;

-- Update just one record to test permissions
UPDATE parking_lots 
SET latitude = -17.8292, longitude = 31.0522 
WHERE name ILIKE '%harare%' 
AND (latitude IS NULL OR longitude IS NULL)
LIMIT 1;

-- Check if the update worked
SELECT 'Update test result:' as result;
SELECT name, latitude, longitude 
FROM parking_lots 
WHERE name ILIKE '%harare%' 
AND latitude IS NOT NULL 
LIMIT 1;

-- Step 4: If the above worked, update all Harare locations
SELECT 'Step 4: Updating all Harare locations...' as step;

UPDATE parking_lots SET 
  latitude = -17.8292, 
  longitude = 31.0522 
WHERE (name ILIKE '%harare%' OR location ILIKE '%harare%')
  AND (latitude IS NULL OR longitude IS NULL);

-- Step 5: Update other major cities one by one
SELECT 'Step 5: Updating Bulawayo locations...' as step;

UPDATE parking_lots SET 
  latitude = -20.1547, 
  longitude = 28.5810 
WHERE (name ILIKE '%bulawayo%' OR location ILIKE '%bulawayo%')
  AND (latitude IS NULL OR longitude IS NULL);

SELECT 'Updating Mutare locations...' as step;

UPDATE parking_lots SET 
  latitude = -18.9707, 
  longitude = 32.6593 
WHERE (name ILIKE '%mutare%' OR location ILIKE '%mutare%')
  AND (latitude IS NULL OR longitude IS NULL);

SELECT 'Updating Airport locations...' as step;

UPDATE parking_lots SET 
  latitude = -17.8216, 
  longitude = 31.0492 
WHERE (name ILIKE '%airport%' OR location ILIKE '%airport%')
  AND (latitude IS NULL OR longitude IS NULL);

-- Step 6: Set default coordinates for any remaining NULL values
SELECT 'Step 6: Setting default coordinates for remaining NULL values...' as step;

UPDATE parking_lots SET 
  latitude = -17.8292, 
  longitude = 31.0522 
WHERE latitude IS NULL OR longitude IS NULL;

-- Step 7: Verify all updates
SELECT 'Step 7: Final verification...' as step;

SELECT 
    COUNT(*) as total_lots,
    COUNT(CASE WHEN latitude IS NOT NULL THEN 1 END) as lots_with_latitude,
    COUNT(CASE WHEN longitude IS NOT NULL THEN 1 END) as lots_with_longitude,
    COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as lots_with_both_coordinates
FROM parking_lots;

-- Show updated results
SELECT 
    name,
    location,
    latitude,
    longitude,
    is_active
FROM parking_lots
WHERE latitude IS NOT NULL AND longitude IS NOT NULL
ORDER BY name;