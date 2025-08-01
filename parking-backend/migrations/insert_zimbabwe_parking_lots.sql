-- Insert realistic parking lots for Zimbabwe locations
-- Areas: CBD, Borrowdale, Avondale, Mount Pleasant, Newlands, Belgravia, etc.

INSERT INTO parking_lots (
    name, 
    location, 
    description, 
    total_spaces, 
    available_spaces, 
    price_per_hour, 
    latitude, 
    longitude, 
    features, 
    is_24_hours, 
    opening_time, 
    closing_time, 
    is_active
) VALUES 

-- CBD (Central Business District) Locations
(
    'Harare CBD Central Parking',
    'Corner First Street & Nelson Mandela Avenue, CBD, Harare',
    'Multi-level parking garage in the heart of Harare CBD. Perfect for business meetings and shopping.',
    150,
    45,
    3.50,
    -17.8292,
    31.0522,
    '[\1]'::jsonb,
    false,
    '06:00:00',
    '22:00:00',
    true
),

(
    'Eastgate Mall Parking',
    'Eastgate Shopping Centre, Robert Mugabe Road, CBD, Harare',
    'Secure parking at Eastgate Mall with easy access to shops, restaurants and offices.',
    200,
    78,
    2.50,
    -17.8201,
    31.0669,
    '[\1]'::jsonb,
    false,
    '07:00:00',
    '21:00:00',
    true
),

(
    'Joina City Parking Garage',
    'Joina City, Corner Jason Moyo & Julius Nyerere Way, CBD, Harare',
    'Modern parking facility at Joina City complex with direct mall access.',
    180,
    52,
    4.00,
    -17.8252,
    31.0492,
    '[\1]'::jsonb,
    false,
    '07:30:00',
    '21:30:00',
    true
),

(
    'Harare Gardens Parking',
    'Near Harare Gardens, Corner 7th Street & Josiah Tongogara Avenue, CBD',
    'Convenient parking near Harare Gardens and government offices.',
    80,
    23,
    3.00,
    -17.8167,
    31.0447,
    '[\1]'::jsonb,
    false,
    '06:30:00',
    '18:00:00',
    true
),

-- Borrowdale Locations
(
    'Borrowdale Village Shopping Centre',
    'Borrowdale Village, Borrowdale Road, Borrowdale, Harare',
    'Premium parking at upmarket Borrowdale Village with high-end shops and restaurants.',
    120,
    34,
    4.50,
    -17.7833,
    31.0833,
    '[\1]'::jsonb,
    false,
    '08:00:00',
    '20:00:00',
    true
),

(
    'Borrowdale Racecourse Parking',
    'Borrowdale Racecourse, Borrowdale Road, Borrowdale, Harare',
    'Large parking area for events at Borrowdale Racecourse and nearby venues.',
    300,
    156,
    2.00,
    -17.7889,
    31.0778,
    '[\1]'::jsonb,
    false,
    '07:00:00',
    '23:00:00',
    true
),

(
    'TM Borrowdale Hypermarket',
    'TM Borrowdale, Borrowdale Road, Borrowdale, Harare',
    'Convenient parking for TM Hypermarket shoppers and surrounding businesses.',
    100,
    41,
    2.50,
    -17.7856,
    31.0811,
    '[\1]'::jsonb,
    false,
    '07:30:00',
    '20:30:00',
    true
),

-- Avondale Locations
(
    'Avondale Shopping Centre',
    'Avondale Shopping Centre, King George Road, Avondale, Harare',
    'Popular shopping centre parking with access to various shops and services.',
    90,
    28,
    3.00,
    -17.8056,
    31.0194,
    '[\1]'::jsonb,
    false,
    '08:00:00',
    '19:00:00',
    true
),

(
    'Avondale Flea Market Parking',
    'Near Avondale Flea Market, King George Road, Avondale, Harare',
    'Weekend parking for flea market visitors and local shoppers.',
    60,
    18,
    2.00,
    -17.8072,
    31.0167,
    '[\1]'::jsonb,
    false,
    '07:00:00',
    '17:00:00',
    true
),

-- Mount Pleasant Locations
(
    'Mount Pleasant Shopping Centre',
    'Mount Pleasant Shopping Centre, Enterprise Road, Mount Pleasant, Harare',
    'Secure parking at Mount Pleasant with easy access to shops and restaurants.',
    85,
    31,
    3.50,
    -17.7944,
    31.0556,
    '[\1]'::jsonb,
    false,
    '08:00:00',
    '19:30:00',
    true
),

(
    'Enterprise Road Office Complex',
    'Enterprise Road Office Park, Mount Pleasant, Harare',
    'Business parking for office workers and visitors in Mount Pleasant area.',
    70,
    22,
    4.00,
    -17.7917,
    31.0583,
    '[\1]'::jsonb,
    false,
    '06:00:00',
    '18:30:00',
    true
),

-- Newlands Locations
(
    'Newlands Shopping Centre',
    'Newlands Shopping Centre, Prince Edward Street, Newlands, Harare',
    'Community shopping centre with ample parking and local amenities.',
    75,
    26,
    3.00,
    -17.8167,
    31.0833,
    '[\1]'::jsonb,
    false,
    '08:00:00',
    '18:00:00',
    true
),

-- Belgravia Locations
(
    'Belgravia Sports Club',
    'Belgravia Sports Club, Josiah Tongogara Avenue, Belgravia, Harare',
    'Parking for sports club members and event attendees.',
    50,
    19,
    2.50,
    -17.8333,
    31.0500,
    '[\1]'::jsonb,
    false,
    '06:00:00',
    '22:00:00',
    true
),

-- Highlands Locations
(
    'Highlands Presbyterian Church',
    'Highlands Presbyterian Church, Highlands, Harare',
    'Church parking available for events and Sunday services.',
    40,
    15,
    2.00,
    -17.7500,
    31.0833,
    '[\1]'::jsonb,
    false,
    '07:00:00',
    '19:00:00',
    true
),

-- Msasa Industrial Area
(
    'Msasa Industrial Park',
    'Msasa Industrial Area, Harare',
    'Industrial area parking for factory workers and business visitors.',
    200,
    89,
    1.50,
    -17.8667,
    31.1167,
    '[\1]'::jsonb,
    true,
    NULL,
    NULL,
    true
),

-- Waterfalls Area
(
    'Waterfalls Shopping Centre',
    'Waterfalls Shopping Centre, High Glen Road, Waterfalls, Harare',
    'Local shopping centre serving Waterfalls and surrounding areas.',
    60,
    21,
    2.50,
    -17.9167,
    31.0833,
    '[\1]'::jsonb,
    false,
    '08:00:00',
    '18:00:00',
    true
),

-- Mbare Area
(
    'Mbare Musika Parking',
    'Near Mbare Musika, Mbare, Harare',
    'Parking for market visitors and commuters using Mbare transport hub.',
    150,
    67,
    1.00,
    -17.8833,
    31.0333,
    '[\1]'::jsonb,
    false,
    '05:00:00',
    '20:00:00',
    true
),

-- Westgate Area
(
    'Westgate Shopping Centre',
    'Westgate Shopping Centre, Westgate, Harare',
    'Popular shopping destination with secure parking facilities.',
    110,
    38,
    3.00,
    -17.8500,
    30.9833,
    '[\1]'::jsonb,
    false,
    '08:00:00',
    '19:00:00',
    true
),

-- Airport Area
(
    'Robert Gabriel Mugabe Airport Parking',
    'Robert Gabriel Mugabe International Airport, Harare',
    'Long-term and short-term parking for airport travelers.',
    400,
    178,
    5.00,
    -17.9319,
    31.0928,
    '[\1]'::jsonb,
    true,
    NULL,
    NULL,
    true
),

-- Chitungwiza (Satellite Town)
(
    'Chitungwiza Shopping Centre',
    'Chitungwiza Town Centre, Chitungwiza',
    'Main shopping centre serving Chitungwiza residents.',
    80,
    29,
    2.00,
    -18.0167,
    31.0833,
    '[\1]'::jsonb,
    false,
    '07:00:00',
    '19:00:00',
    true
),

-- Kuwadzana Area
(
    'Kuwadzana Shopping Centre',
    'Kuwadzana Shopping Centre, Kuwadzana, Harare',
    'Community shopping centre serving high-density suburbs.',
    70,
    25,
    1.50,
    -17.8833,
    30.9500,
    '[\1]'::jsonb,
    false,
    '07:00:00',
    '18:00:00',
    true
);

-- Update the parking lot count and add some additional features
UPDATE parking_lots SET 
    features = '[\1]'::jsonb
WHERE name = 'Harare CBD Central Parking';

UPDATE parking_lots SET 
    features = '[\1]'::jsonb
WHERE name = 'Borrowdale Village Shopping Centre';

-- Add some comments for better understanding
COMMENT ON TABLE parking_lots IS 'Parking lots across Harare and surrounding areas including CBD, Borrowdale, Avondale, and other popular locations';

-- Success message
SELECT 'Successfully inserted ' || COUNT(*) || ' parking lots for Zimbabwe locations!' as status
FROM parking_lots 
WHERE created_at >= NOW() - INTERVAL '1 minute';
