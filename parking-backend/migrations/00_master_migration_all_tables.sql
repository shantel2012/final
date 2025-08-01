-- Master Migration: Complete Parking Management System Database Setup
-- Run this migration in Supabase SQL Editor to create all tables and functions
-- This creates the complete database schema for the parking management system

-- ============================================================================
-- 1. USERS TABLE (Base authentication table)
-- ============================================================================

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'parking_owner')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_email CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Enable RLS for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can view their own data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================================
-- 2. PARKING LOTS TABLE
-- ============================================================================

-- Create parking lots table
CREATE TABLE IF NOT EXISTS parking_lots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100) DEFAULT 'Zimbabwe',
    location TEXT NOT NULL,
    description TEXT,
    total_spaces INTEGER NOT NULL CHECK (total_spaces > 0),
    available_spaces INTEGER NOT NULL CHECK (available_spaces >= 0),
    price_per_hour DECIMAL(10,2) NOT NULL CHECK (price_per_hour >= 0),
    
    -- Operating hours
    opening_time TIME DEFAULT '06:00:00',
    closing_time TIME DEFAULT '22:00:00',
    
    -- Features and amenities
    features JSONB DEFAULT '[]'::jsonb,
    
    -- Contact and management
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_24_hours BOOLEAN DEFAULT false,
    
    -- Location coordinates (optional for maps)
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT available_spaces_check CHECK (available_spaces <= total_spaces),
    CONSTRAINT valid_hours CHECK (opening_time < closing_time OR is_24_hours = true),
    CONSTRAINT valid_email CHECK (contact_email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' OR contact_email IS NULL)
);

-- Create indexes for parking lots
CREATE INDEX IF NOT EXISTS idx_parking_lots_name ON parking_lots(name);
CREATE INDEX IF NOT EXISTS idx_parking_lots_location ON parking_lots(location);
CREATE INDEX IF NOT EXISTS idx_parking_lots_is_active ON parking_lots(is_active);
CREATE INDEX IF NOT EXISTS idx_parking_lots_available_spaces ON parking_lots(available_spaces);
CREATE INDEX IF NOT EXISTS idx_parking_lots_price ON parking_lots(price_per_hour);
CREATE INDEX IF NOT EXISTS idx_parking_lots_coordinates ON parking_lots(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_parking_lots_features ON parking_lots USING GIN (features);

-- Enable RLS for parking lots
ALTER TABLE parking_lots ENABLE ROW LEVEL SECURITY;

-- Everyone can view active parking lots
CREATE POLICY "Everyone can view active parking lots" ON parking_lots
    FOR SELECT USING (is_active = true);

-- Admins can manage all parking lots
CREATE POLICY "Admins can manage parking lots" ON parking_lots
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================================
-- 3. USER PROFILES TABLE
-- ============================================================================

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Personal Information
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Zimbabwe',
    date_of_birth DATE,
    
    -- Profile Media
    profile_picture_url TEXT,
    
    -- Preferences (stored as JSON)
    preferences JSONB DEFAULT '{
        "notifications": {
            "email": true,
            "sms": true,
            "push": true
        },
        "parking": {
            "preferred_payment_method": "card",
            "auto_extend_booking": false,
            "reminder_minutes": 30
        },
        "privacy": {
            "show_profile": false,
            "share_location": false
        }
    }'::jsonb,
    
    -- Emergency Contact
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(50),
    
    -- Account Status
    is_verified BOOLEAN DEFAULT false,
    verification_method VARCHAR(20), -- 'email', 'phone', 'document'
    verification_date TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(user_id),
    CONSTRAINT valid_phone CHECK (phone ~ '^[+]?[0-9\s\-\(\)]+$' OR phone IS NULL),
    CONSTRAINT valid_postal_code CHECK (postal_code ~ '^[0-9A-Za-z\s\-]+$' OR postal_code IS NULL)
);

-- Create indexes for user profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_phone ON user_profiles(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_profiles_city ON user_profiles(city) WHERE city IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_verified ON user_profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_user_profiles_preferences ON user_profiles USING GIN (preferences);

-- Enable RLS for user profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view and edit their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================================
-- 4. BOOKINGS TABLE
-- ============================================================================

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parking_lot_id UUID NOT NULL REFERENCES parking_lots(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT check_booking_times CHECK (end_time > start_time)
);

-- Create indexes for bookings
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_parking_lot_id ON bookings(parking_lot_id);
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_end_time ON bookings(end_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Enable RLS for bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Users can view their own bookings
CREATE POLICY "Users can view own bookings" ON bookings
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own bookings
CREATE POLICY "Users can create own bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own bookings
CREATE POLICY "Users can update own bookings" ON bookings
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins can view all bookings
CREATE POLICY "Admins can view all bookings" ON bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================================
-- 5. FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parking_lots_updated_at 
    BEFORE UPDATE ON parking_lots 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at 
    BEFORE UPDATE ON bookings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user profile when user is created
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (user_id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-create profile for new users
CREATE TRIGGER trigger_create_user_profile
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile();

-- Function to update parking lot availability when booking is created/updated/deleted
CREATE OR REPLACE FUNCTION update_parking_availability()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle INSERT
    IF TG_OP = 'INSERT' THEN
        IF NEW.status = 'active' THEN
            UPDATE parking_lots 
            SET available_spaces = available_spaces - 1 
            WHERE id = NEW.parking_lot_id AND available_spaces > 0;
        END IF;
        RETURN NEW;
    END IF;
    
    -- Handle UPDATE
    IF TG_OP = 'UPDATE' THEN
        -- If booking was activated
        IF OLD.status != 'active' AND NEW.status = 'active' THEN
            UPDATE parking_lots 
            SET available_spaces = available_spaces - 1 
            WHERE id = NEW.parking_lot_id AND available_spaces > 0;
        -- If booking was deactivated
        ELSIF OLD.status = 'active' AND NEW.status != 'active' THEN
            UPDATE parking_lots 
            SET available_spaces = available_spaces + 1 
            WHERE id = NEW.parking_lot_id;
        END IF;
        RETURN NEW;
    END IF;
    
    -- Handle DELETE
    IF TG_OP = 'DELETE' THEN
        IF OLD.status = 'active' THEN
            UPDATE parking_lots 
            SET available_spaces = available_spaces + 1 
            WHERE id = OLD.parking_lot_id;
        END IF;
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for parking availability updates
CREATE TRIGGER trigger_update_parking_availability
    AFTER INSERT OR UPDATE OR DELETE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_parking_availability();

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

SELECT 'Master migration completed successfully!' as status,
       'All tables, indexes, triggers, and views created' as note,
       'Ready to insert sample data' as next_step;