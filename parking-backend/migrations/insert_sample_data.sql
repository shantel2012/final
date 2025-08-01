-- Insert sample users and bookings to make the system look realistic
-- This should be run after the main tables are created

-- First, let's add some sample users (with hashed passwords)
-- Password for all test users is: "password123" (hashed with bcrypt)
INSERT INTO users (email, password, full_name, phone_number, role) VALUES 
('john.doe@gmail.com', '$2b$10$rOzJqQZJqQZJqQZJqQZJqOzJqQZJqQZJqQZJqQZJqQZJqQZJqQZJq', 'John Doe', '+263771234567', 'user'),
('mary.smith@gmail.com', '$2b$10$rOzJqQZJqQZJqQZJqQZJqOzJqQZJqQZJqQZJqQZJqQZJqQZJqQZJq', 'Mary Smith', '+263772345678', 'user'),
('peter.jones@gmail.com', '$2b$10$rOzJqQZJqQZJqQZJqQZJqOzJqQZJqQZJqQZJqQZJqQZJqQZJqQZJq', 'Peter Jones', '+263773456789', 'user'),
('sarah.wilson@gmail.com', '$2b$10$rOzJqQZJqQZJqQZJqQZJqOzJqQZJqQZJqQZJqQZJqQZJqQZJqQZJq', 'Sarah Wilson', '+263774567890', 'user'),
('admin@parkingapp.com', '$2b$10$rOzJqQZJqQZJqQZJqQZJqOzJqQZJqQZJqQZJqQZJqQZJqQZJqQZJq', 'System Admin', '+263775678901', 'admin'),
('owner1@gmail.com', '$2b$10$rOzJqQZJqQZJqQZJqQZJqOzJqQZJqQZJqQZJqQZJqQZJqQZJqQZJq', 'Parking Owner 1', '+263776789012', 'owner')
ON CONFLICT (email) DO NOTHING;

-- Add some realistic bookings for the past few days and upcoming days
-- We'll use the parking lots we just created

-- Get some parking lot IDs (we'll use the first few)
WITH parking_lot_ids AS (
  SELECT id, name FROM parking_lots LIMIT 10
),
user_ids AS (
  SELECT id, email FROM users WHERE role = 'user' LIMIT 4
)

-- Insert sample bookings
INSERT INTO bookings (user_id, parking_lot_id, start_time, end_time, total_cost, status)
SELECT 
  u.id,
  p.id,
  start_time,
  end_time,
  total_cost,
  status
FROM (
  VALUES 
    -- Recent completed bookings
    (1, 1, NOW() - INTERVAL '2 days' + INTERVAL '9 hours', NOW() - INTERVAL '2 days' + INTERVAL '17 hours', 28.00, 'completed'),
    (2, 2, NOW() - INTERVAL '1 day' + INTERVAL '8 hours', NOW() - INTERVAL '1 day' + INTERVAL '12 hours', 10.00, 'completed'),
    (3, 3, NOW() - INTERVAL '3 days' + INTERVAL '14 hours', NOW() - INTERVAL '3 days' + INTERVAL '18 hours', 16.00, 'completed'),
    (1, 4, NOW() - INTERVAL '1 day' + INTERVAL '10 hours', NOW() - INTERVAL '1 day' + INTERVAL '15 hours', 15.00, 'completed'),
    
    -- Active bookings (currently ongoing)
    (2, 1, NOW() - INTERVAL '2 hours', NOW() + INTERVAL '6 hours', 28.00, 'active'),
    (4, 5, NOW() - INTERVAL '1 hour', NOW() + INTERVAL '3 hours', 14.00, 'active'),
    
    -- Future bookings
    (1, 2, NOW() + INTERVAL '1 day' + INTERVAL '9 hours', NOW() + INTERVAL '1 day' + INTERVAL '17 hours', 20.00, 'active'),
    (3, 6, NOW() + INTERVAL '2 days' + INTERVAL '8 hours', NOW() + INTERVAL '2 days' + INTERVAL '16 hours', 36.00, 'active'),
    (4, 3, NOW() + INTERVAL '3 days' + INTERVAL '10 hours', NOW() + INTERVAL '3 days' + INTERVAL '14 hours', 16.00, 'active'),
    (2, 7, NOW() + INTERVAL '1 day' + INTERVAL '13 hours', NOW() + INTERVAL '1 day' + INTERVAL '18 hours', 17.50, 'active')
) AS booking_data(user_idx, lot_idx, start_time, end_time, total_cost, status)
CROSS JOIN (SELECT id, ROW_NUMBER() OVER() as rn FROM (SELECT id FROM users WHERE role = 'user' LIMIT 4) u) u ON u.rn = booking_data.user_idx
CROSS JOIN (SELECT id, ROW_NUMBER() OVER() as rn FROM (SELECT id FROM parking_lots LIMIT 10) p) p ON p.rn = booking_data.lot_idx;

-- Update some parking lots to show realistic availability based on active bookings
UPDATE parking_lots SET available_spaces = total_spaces - 1 
WHERE id IN (
  SELECT DISTINCT parking_lot_id 
  FROM bookings 
  WHERE status = 'active' 
  AND start_time <= NOW() 
  AND end_time > NOW()
);

-- Add some variety to the features of different parking lots
UPDATE parking_lots SET features = ARRAY['outdoor', 'security_guard', 'budget_friendly'] 
WHERE price_per_hour < 2.50;

UPDATE parking_lots SET features = ARRAY['covered', 'security_cameras', 'premium_location', 'valet_parking'] 
WHERE price_per_hour > 4.00;

UPDATE parking_lots SET features = ARRAY['covered', 'security_cameras', 'wheelchair_accessible', 'ev_charging', 'online_booking'] 
WHERE name LIKE '%CBD%' OR name LIKE '%Borrowdale%';

-- Add some weekend-only parking lots
UPDATE parking_lots SET 
  opening_time = '08:00:00',
  closing_time = '17:00:00',
  description = description || ' Weekend market parking available.'
WHERE name LIKE '%Flea Market%';

-- Make airport parking more expensive for long-term
UPDATE parking_lots SET 
  price_per_hour = 3.00,
  description = 'Long-term and short-term parking. Special daily rates available: $20/day, $120/week.'
WHERE name LIKE '%Airport%';

-- Add some promotional pricing
UPDATE parking_lots SET 
  description = description || ' SPECIAL OFFER: First 2 hours free on weekends!'
WHERE name IN ('Eastgate Mall Parking', 'Westgate Shopping Centre');

-- Success message
SELECT 
  'Sample data inserted successfully!' as status,
  (SELECT COUNT(*) FROM users WHERE role = 'user') as total_users,
  (SELECT COUNT(*) FROM bookings) as total_bookings,
  (SELECT COUNT(*) FROM parking_lots) as total_parking_lots;