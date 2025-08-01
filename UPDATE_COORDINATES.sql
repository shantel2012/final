
-- Update parking lots with GPS coordinates for Zimbabwe locations

-- Update existing parking lots with coordinates
UPDATE parking_lots SET 
  latitude = -17.8292, 
  longitude = 31.0522 
WHERE name LIKE '%Harare%' OR location LIKE '%Harare%';

UPDATE parking_lots SET 
  latitude = -20.1547, 
  longitude = 28.5810 
WHERE name LIKE '%Bulawayo%' OR location LIKE '%Bulawayo%';

UPDATE parking_lots SET 
  latitude = -18.9707, 
  longitude = 32.6593 
WHERE name LIKE '%Mutare%' OR location LIKE '%Mutare%';

UPDATE parking_lots SET 
  latitude = -17.8216, 
  longitude = 31.0492 
WHERE name LIKE '%Airport%' OR location LIKE '%Airport%';

-- Add some specific coordinates for major areas in Harare
UPDATE parking_lots SET 
  latitude = -17.8277, 
  longitude = 31.0534 
WHERE name LIKE '%CBD%' OR location LIKE '%CBD%' OR location LIKE '%Central%';

UPDATE parking_lots SET 
  latitude = -17.7840, 
  longitude = 31.0534 
WHERE name LIKE '%Avondale%' OR location LIKE '%Avondale%';

UPDATE parking_lots SET 
  latitude = -17.8050, 
  longitude = 31.0350 
WHERE name LIKE '%Borrowdale%' OR location LIKE '%Borrowdale%';

UPDATE parking_lots SET 
  latitude = -17.8650, 
  longitude = 31.0200 
WHERE name LIKE '%Westgate%' OR location LIKE '%Westgate%';

-- If no specific coordinates were set, use default Harare coordinates
UPDATE parking_lots SET 
  latitude = -17.8292, 
  longitude = 31.0522 
WHERE latitude IS NULL OR longitude IS NULL;

-- Add some sample parking lots with specific coordinates for testing
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
);