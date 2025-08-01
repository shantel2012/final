
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
    '["covered", "security_cameras", "wheelchair_accessible", "ev_charging"]'::jsonb,
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
    '["covered", "security_cameras", "shopping_mall_access", "restaurants_nearby"]'::jsonb,
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
    '["covered", "security_cameras", "shopping_mall_access", "air_conditioned"]'::jsonb,
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
    '["outdoor", "security_guard", "government_offices_nearby"]'::jsonb,
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
    '["covered", "security_cameras", "valet_parking", "luxury_shopping"]'::jsonb,
    false,
    '08:00:00',
    '20:00:00',
    true
),

(
    'Borrowdale Race Course',
    'Borrowdale Race Course, Borrowdale Road, Borrowdale, Harare',
    'Large outdoor parking area for events and weekend activities at the race course.',
    500,
    156,
    2.00,
    -17.7889,
    31.0778,
    '["outdoor", "event_parking", "large_capacity", "security_guard"]'::jsonb,
    false,
    '07:00:00',
    '23:00:00',
    true
),

(
    'TM Pick n Pay Borrowdale',
    'TM Pick n Pay Borrowdale, Borrowdale Road, Borrowdale, Harare',
    'Convenient parking for grocery shopping and nearby businesses.',
    90,
    41,
    2.50,
    -17.7856,
    31.0811,
    '["covered", "security_cameras", "supermarket_access", "trolley_bays"]'::jsonb,
    false,
    '07:30:00',
    '20:30:00',
    true
),

-- Avondale Locations
(
    'Avondale Shopping Centre',
    'Avondale Shopping Centre, King George Road, Avondale, Harare',
    'Local shopping centre parking with access to shops and services.',
    70,
    28,
    3.00,
    -17.8056,
    31.0194,
    '["covered", "security_cameras", "shopping_centre_access"]'::jsonb,
    false,
    '08:00:00',
    '19:00:00',
    true
),

(
    'Avondale Flea Market',
    'Avondale Flea Market, King George Road, Avondale, Harare',
    'Weekend market parking with local crafts and food vendors.',
    45,
    18,
    2.00,
    -17.8072,
    31.0167,
    '["outdoor", "weekend_market", "security_guard"]'::jsonb,
    false,
    '07:00:00',
    '17:00:00',
    true
),

-- Mount Pleasant Locations
(
    'Mount Pleasant Shopping Centre',
    'Mount Pleasant Shopping Centre, Enterprise Road, Mount Pleasant, Harare',
    'Community shopping centre with restaurants and local businesses.',
    85,
    31,
    3.50,
    -17.7944,
    31.0556,
    '["covered", "security_cameras", "restaurants_nearby"]'::jsonb,
    false,
    '08:00:00',
    '19:30:00',
    true
),

(
    'Mount Pleasant Business Park',
    'Mount Pleasant Business Park, Enterprise Road, Mount Pleasant, Harare',
    'Business district parking for offices and corporate meetings.',
    60,
    22,
    4.00,
    -17.7917,
    31.0583,
    '["covered", "security_cameras", "business_district", "reserved_spaces"]'::jsonb,
    false,
    '06:00:00',
    '18:30:00',
    true
),

-- Newlands Locations
(
    'Newlands Shopping Centre',
    'Newlands Shopping Centre, Prince Edward Street, Newlands, Harare',
    'Local community centre with shops and services.',
    55,
    26,
    3.00,
    -17.8167,
    31.0833,
    '["covered", "security_cameras", "community_centre"]'::jsonb,
    false,
    '08:00:00',
    '18:00:00',
    true
),

(
    'Newlands Sports Club',
    'Newlands Sports Club, Prince Edward Street, Newlands, Harare',
    'Sports club parking for members and event attendees.',
    40,
    19,
    2.50,
    -17.8333,
    31.0500,
    '["outdoor", "sports_club", "event_parking", "security_guard"]'::jsonb,
    false,
    '06:00:00',
    '22:00:00',
    true
),

-- Belgravia & Highlands Locations
(
    'Belgravia Methodist Church',
    'Belgravia Methodist Church, Josiah Tongogara Avenue, Belgravia, Harare',
    'Church parking available for services and community events.',
    35,
    15,
    2.00,
    -17.7500,
    31.0833,
    '["outdoor", "church_parking", "weekend_availability"]'::jsonb,
    false,
    '07:00:00',
    '19:00:00',
    true
),

-- Industrial Areas
(
    'Southerton Industrial Area',
    'Southerton Industrial Area, Seke Road, Southerton, Harare',
    'Large industrial parking for workers and business visitors.',
    200,
    89,
    1.50,
    -17.8667,
    31.1167,
    '["outdoor", "industrial_area", "large_capacity", "security_guard"]'::jsonb,
    true,
    NULL,
    NULL,
    true
),

(
    'Workington Shopping Centre',
    'Workington Shopping Centre, Seke Road, Workington, Harare',
    'Local shopping centre serving industrial area workers.',
    65,
    21,
    2.50,
    -17.9167,
    31.0833,
    '["covered", "security_cameras", "local_shopping"]'::jsonb,
    false,
    '08:00:00',
    '18:00:00',
    true
),

-- Transport Hubs
(
    'Mbare Musika Market',
    'Mbare Musika Market, Cripps Road, Mbare, Harare',
    'Market parking with access to public transport and local vendors.',
    150,
    67,
    1.00,
    -17.8833,
    31.0333,
    '["outdoor", "market_access", "transport_hub", "budget_friendly"]'::jsonb,
    false,
    '05:00:00',
    '20:00:00',
    true
),

(
    'Westgate Shopping Centre',
    'Westgate Shopping Centre, Bulawayo Road, Westgate, Harare',
    'Family-friendly shopping centre with restaurants and entertainment.',
    110,
    38,
    3.00,
    -17.8500,
    30.9833,
    '["covered", "security_cameras", "shopping_centre_access", "family_friendly"]'::jsonb,
    false,
    '08:00:00',
    '19:00:00',
    true
),

-- Airport Area
(
    'Robert Gabriel Mugabe International Airport',
    'Robert Gabriel Mugabe International Airport, Airport Road, Harare',
    'Airport parking for short-term and long-term stays with shuttle service.',
    400,
    178,
    5.00,
    -17.9319,
    31.0928,
    '["covered", "security_cameras", "airport_parking", "long_term_rates"]'::jsonb,
    true,
    NULL,
    NULL,
    true
),

-- Chitungwiza
(
    'Chitungwiza Shopping Centre',
    'Chitungwiza Shopping Centre, Seke Road, Chitungwiza',
    'Main shopping centre serving Chitungwiza residents.',
    80,
    29,
    2.00,
    -18.0167,
    31.0833,
    '["covered", "security_cameras", "town_centre", "public_transport"]'::jsonb,
    false,
    '07:00:00',
    '19:00:00',
    true
),

-- Norton
(
    'Norton Shopping Centre',
    'Norton Shopping Centre, Harare-Bulawayo Road, Norton',
    'Small town shopping centre with local businesses.',
    50,
    25,
    1.50,
    -17.8833,
    30.9500,
    '["outdoor", "small_town", "local_businesses"]'::jsonb,
    false,
    '07:00:00',
    '18:00:00',
    true
);

-- Success message
SELECT 'Zimbabwe parking lots inserted successfully!' as status,
       COUNT(*) || ' parking lots added' as count
FROM parking_lots;