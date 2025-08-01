-- Add triggers to automatically update parking lot availability when bookings change

-- Function to update parking lot availability
CREATE OR REPLACE FUNCTION update_parking_availability()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle INSERT (new booking)
    IF TG_OP = 'INSERT' THEN
        -- Decrease available spaces when a new active booking is created
        IF NEW.status = 'active' THEN
            UPDATE parking_lots 
            SET available_spaces = available_spaces - 1
            WHERE id = NEW.parking_lot_id 
            AND available_spaces > 0;
        END IF;
        RETURN NEW;
    END IF;
    
    -- Handle UPDATE (booking status change)
    IF TG_OP = 'UPDATE' THEN
        -- If booking was cancelled or completed, increase available spaces
        IF OLD.status = 'active' AND NEW.status IN ('cancelled', 'completed') THEN
            UPDATE parking_lots 
            SET available_spaces = available_spaces + 1
            WHERE id = NEW.parking_lot_id 
            AND available_spaces < (SELECT total_spaces FROM parking_lots WHERE id = NEW.parking_lot_id);
        END IF;
        
        -- If booking was reactivated, decrease available spaces
        IF OLD.status IN ('cancelled', 'completed') AND NEW.status = 'active' THEN
            UPDATE parking_lots 
            SET available_spaces = available_spaces - 1
            WHERE id = NEW.parking_lot_id 
            AND available_spaces > 0;
        END IF;
        
        RETURN NEW;
    END IF;
    
    -- Handle DELETE (booking removed)
    IF TG_OP = 'DELETE' THEN
        -- Increase available spaces when an active booking is deleted
        IF OLD.status = 'active' THEN
            UPDATE parking_lots 
            SET available_spaces = available_spaces + 1
            WHERE id = OLD.parking_lot_id 
            AND available_spaces < (SELECT total_spaces FROM parking_lots WHERE id = OLD.parking_lot_id);
        END IF;
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic availability updates
DROP TRIGGER IF EXISTS trigger_update_availability_insert ON bookings;
CREATE TRIGGER trigger_update_availability_insert
    AFTER INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_parking_availability();

DROP TRIGGER IF EXISTS trigger_update_availability_update ON bookings;
CREATE TRIGGER trigger_update_availability_update
    AFTER UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_parking_availability();

DROP TRIGGER IF EXISTS trigger_update_availability_delete ON bookings;
CREATE TRIGGER trigger_update_availability_delete
    AFTER DELETE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_parking_availability();

-- Function to check and update expired bookings
CREATE OR REPLACE FUNCTION update_expired_bookings()
RETURNS void AS $$
BEGIN
    -- Mark bookings as completed if their end_time has passed
    UPDATE bookings 
    SET status = 'completed'
    WHERE status = 'active' 
    AND end_time < NOW();
    
    -- The trigger will automatically update parking lot availability
END;
$$ LANGUAGE plpgsql;

-- Create a view for real-time parking availability
CREATE OR REPLACE VIEW parking_availability AS
SELECT 
    pl.id,
    pl.name,
    pl.location,
    pl.total_spaces,
    pl.available_spaces,
    pl.price_per_hour,
    pl.is_active,
    pl.is_24_hours,
    pl.opening_time,
    pl.closing_time,
    pl.features,
    pl.latitude,
    pl.longitude,
    -- Calculate occupancy percentage
    CASE 
        WHEN pl.total_spaces > 0 
        THEN ROUND(((pl.total_spaces - pl.available_spaces)::DECIMAL / pl.total_spaces) * 100, 1)
        ELSE 0 
    END as occupancy_percentage,
    -- Count current active bookings
    COALESCE(active_bookings.count, 0) as active_bookings_count,
    -- Check if currently open
    CASE 
        WHEN pl.is_24_hours THEN true
        WHEN pl.opening_time IS NULL OR pl.closing_time IS NULL THEN true
        ELSE CURRENT_TIME BETWEEN pl.opening_time AND pl.closing_time
    END as is_currently_open
FROM parking_lots pl
LEFT JOIN (
    SELECT 
        parking_lot_id,
        COUNT(*) as count
    FROM bookings 
    WHERE status = 'active' 
    AND start_time <= NOW() 
    AND end_time > NOW()
    GROUP BY parking_lot_id
) active_bookings ON pl.id = active_bookings.parking_lot_id
WHERE pl.is_active = true
ORDER BY pl.name;

-- Add comments
COMMENT ON FUNCTION update_parking_availability() IS 'Automatically updates parking lot availability when bookings are created, updated, or deleted';
COMMENT ON FUNCTION update_expired_bookings() IS 'Marks expired bookings as completed and updates availability';
COMMENT ON VIEW parking_availability IS 'Real-time view of parking lot availability with occupancy statistics';

-- Success message
SELECT 'Parking availability triggers and functions created successfully!' as status;