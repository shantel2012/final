-- Safe update script for parking lots coordinates
-- This script handles potential issues and provides better error handling

-- First, check if the table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'parking_lots') THEN
        RAISE EXCEPTION 'Table parking_lots does not exist. Please create it first.';
    END IF;
END $$;

-- Add latitude and longitude columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parking_lots' AND column_name = 'latitude') THEN
        ALTER TABLE parking_lots ADD COLUMN latitude DECIMAL(10, 8);
        RAISE NOTICE 'Added latitude column to parking_lots table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parking_lots' AND column_name = 'longitude') THEN
        ALTER TABLE parking_lots ADD COLUMN longitude DECIMAL(11, 8);
        RAISE NOTICE 'Added longitude column to parking_lots table';
    END IF;
END $$;

-- Update existing parking lots with coordinates (only if they exist)
-- Harare locations
UPDATE parking_lots SET 
  latitude = -17.8292, 
  longitude = 31.0522 
WHERE (name ILIKE '%Harare%' OR location ILIKE '%Harare%')
  AND latitude IS NULL;

-- Bulawayo locations  
UPDATE parking_lots SET 
  latitude = -20.1547, 
  longitude = 28.5810 
WHERE (name ILIKE '%Bulawayo%' OR location ILIKE '%Bulawayo%')
  AND latitude IS NULL;

-- Mutare locations
UPDATE parking_lots SET 
  latitude = -18.9707, 
  longitude = 32.6593 
WHERE (name ILIKE '%Mutare%' OR location ILIKE '%Mutare%')
  AND latitude IS NULL;

-- Airport locations
UPDATE parking_lots SET 
  latitude = -17.8216, 
  longitude = 31.0492 
WHERE (name ILIKE '%Airport%' OR location ILIKE '%Airport%')
  AND latitude IS NULL;

-- Specific Harare areas
UPDATE parking_lots SET 
  latitude = -17.8277, 
  longitude = 31.0534 
WHERE (name ILIKE '%CBD%' OR location ILIKE '%CBD%' OR location ILIKE '%Central%')
  AND latitude IS NULL;

UPDATE parking_lots SET 
  latitude = -17.7840, 
  longitude = 31.0534 
WHERE (name ILIKE '%Avondale%' OR location ILIKE '%Avondale%')
  AND latitude IS NULL;

UPDATE parking_lots SET 
  latitude = -17.8050, 
  longitude = 31.0350 
WHERE (name ILIKE '%Borrowdale%' OR location ILIKE '%Borrowdale%')
  AND latitude IS NULL;

UPDATE parking_lots SET 
  latitude = -17.8650, 
  longitude = 31.0200 
WHERE (name ILIKE '%Westgate%' OR location ILIKE '%Westgate%')
  AND latitude IS NULL;

-- Default coordinates for any remaining null values
UPDATE parking_lots SET 
  latitude = -17.8292, 
  longitude = 31.0522 
WHERE latitude IS NULL OR longitude IS NULL;

-- Insert sample parking lots (with conflict handling)
INSERT INTO parking_lots (
  name, 
  location, 
  description, 
  total_spaces, 
  available_spaces, 
  price_per_hour, 
  latitude, 
  longitude, 
  is_active, 
  is_24_hours,
  opening_time,
  closing_time,
  features
) VALUES 
(
  'Eastgate Mall Parking',
  'Eastgate Shopping Centre, Harare',
  'Secure covered parking at Eastgate Mall with 24/7 security',
  200,
  150,
  2.50,
  -17.8640,
  31.1470,
  true,
  true,
  null,
  null,
  ARRAY['covered', 'security', 'cctv', 'disabled_access']
),
(
  'Sam Levy Village Parking',
  'Sam Levy Village, Borrowdale, Harare',
  'Premium shopping center parking with valet service',
  150,
  80,
  3.00,
  -17.8050,
  31.0350,
  true,
  false,
  '06:00',
  '22:00',
  ARRAY['covered', 'valet', 'security', 'ev_charging']
),
(
  'Avondale Shopping Centre',
  'Avondale, Harare',
  'Convenient shopping center parking',
  100,
  60,
  2.00,
  -17.7840,
  31.0534,
  true,
  false,
  '07:00',
  '21:00',
  ARRAY['covered', 'security']
),
(
  'Harare CBD Street Parking',
  'First Street, Harare CBD',
  'Street parking in the heart of Harare business district',
  50,
  25,
  1.50,
  -17.8277,
  31.0534,
  true,
  false,
  '06:00',
  '18:00',
  ARRAY['street_parking']
),
(
  'Belgravia Sports Club',
  'Belgravia, Harare',
  'Sports club parking available for events and dining',
  80,
  70,
  2.00,
  -17.8100,
  31.0600,
  true,
  false,
  '08:00',
  '23:00',
  ARRAY['security', 'restaurant_access']
)
ON CONFLICT (name) DO NOTHING;

-- Show results
SELECT 
    name, 
    location, 
    latitude, 
    longitude, 
    is_active,
    available_spaces
FROM parking_lots 
WHERE latitude IS NOT NULL 
ORDER BY name;