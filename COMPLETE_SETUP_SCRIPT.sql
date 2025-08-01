-- COMPLETE SUPABASE SETUP SCRIPT
-- Copy this entire script and paste it into Supabase SQL Editor, then click RUN

-- First, let's check if the table exists and create it if needed
CREATE TABLE IF NOT EXISTS parking_lots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location TEXT NOT NULL,
    description TEXT,
    total_spaces INTEGER NOT NULL CHECK (total_spaces > 0),
    available_spaces INTEGER NOT NULL CHECK (available_spaces >= 0),
    price_per_hour DECIMAL(10,2) NOT NULL CHECK (price_per_hour >= 0),
    opening_time TIME DEFAULT '06:00:00',
    closing_time TIME DEFAULT '22:00:00',
    features JSONB DEFAULT '[]'::jsonb,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    is_24_hours BOOLEAN DEFAULT false,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT available_spaces_check CHECK (available_spaces <= total_spaces)
);

-- Add coordinates columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parking_lots' AND column_name = 'latitude') THEN
        ALTER TABLE parking_lots ADD COLUMN latitude DECIMAL(10,8);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parking_lots' AND column_name = 'longitude') THEN
        ALTER TABLE parking_lots ADD COLUMN longitude DECIMAL(11,8);
    END IF;
END $$;

-- Clear existing data and insert fresh sample data with coordinates
DELETE FROM parking_lots;

-- Insert sample parking lots with proper coordinates
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
-- Harare locations
(
    'Harare CBD Central Parking',
    'First Street & Jason Moyo Avenue, Harare CBD',
    'Premium parking in the heart of Harare business district',
    150,
    120,
    5.00,
    -17.8292,
    31.0522,
    true,
    false,
    '06:00',
    '22:00',
    '["covered", "security", "cctv", "disabled_access"]'::jsonb
),
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
    '["covered", "security", "cctv", "disabled_access"]'::jsonb
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
    '["covered", "valet", "security", "ev_charging"]'::jsonb
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
    '["covered", "security"]'::jsonb
),
(
    'University of Zimbabwe Parking',
    'Mount Pleasant, Harare',
    'Student and staff parking facility',
    200,
    150,
    2.00,
    -17.7840,
    31.0534,
    true,
    false,
    '06:00',
    '20:00',
    '["student_discount", "staff_parking", "bicycle_racks"]'::jsonb
),
(
    'Robert Mugabe International Airport',
    'Harare International Airport',
    'Short-term and long-term airport parking',
    500,
    380,
    8.00,
    -17.9318,
    31.0928,
    true,
    true,
    null,
    null,
    '["covered", "shuttle_service", "security", "long_term"]'::jsonb
),
(
    'Belgravia Sports Club',
    'Belgravia, Harare',
    'Sports club parking for events and dining',
    80,
    70,
    2.00,
    -17.8100,
    31.0600,
    true,
    false,
    '08:00',
    '23:00',
    '["security", "restaurant_access"]'::jsonb
),
-- Bulawayo locations
(
    'Bulawayo City Centre Parking',
    'Corner of 9th Avenue & Fife Street, Bulawayo CBD',
    'Central parking facility in Bulawayo city centre',
    250,
    200,
    4.50,
    -20.1500,
    28.5833,
    true,
    false,
    '06:00',
    '20:00',
    '["city_centre", "covered_sections", "security"]'::jsonb
),
-- Mutare locations
(
    'Mutare Central Parking',
    'Herbert Chitepo Street, Mutare CBD',
    'Central business district parking in Mutare',
    120,
    95,
    3.50,
    -18.9707,
    32.6473,
    true,
    false,
    '07:00',
    '19:00',
    '["cbd_access", "security", "disabled_access"]'::jsonb
),
-- Victoria Falls (tourist area)
(
    'Victoria Falls Tourism Parking',
    'Livingstone Way, Victoria Falls',
    'Tourist parking near Victoria Falls attractions',
    400,
    320,
    7.00,
    -17.9243,
    25.8572,
    true,
    false,
    '06:00',
    '22:00',
    '["tourism", "hotel_access", "tour_pickup", "security"]'::jsonb
);

-- Enable Row Level Security (optional - can be disabled for testing)
ALTER TABLE parking_lots ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows everyone to read parking lots
DROP POLICY IF EXISTS "Everyone can view parking lots" ON parking_lots;
CREATE POLICY "Everyone can view parking lots" ON parking_lots
    FOR SELECT USING (true);

-- Create a policy for authenticated users to insert/update (for testing)
DROP POLICY IF EXISTS "Authenticated users can manage parking lots" ON parking_lots;
CREATE POLICY "Authenticated users can manage parking lots" ON parking_lots
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Show results
SELECT 
    'SUCCESS! 🎉' as status,
    COUNT(*) || ' parking lots created' as count,
    'All locations have GPS coordinates' as coordinates_status
FROM parking_lots;

-- Display the created parking lots
SELECT 
    name,
    location,
    latitude,
    longitude,
    total_spaces,
    available_spaces,
    price_per_hour,
    is_active
FROM parking_lots
ORDER BY name;