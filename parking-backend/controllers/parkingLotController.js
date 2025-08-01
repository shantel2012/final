const { supabase } = require('../supabase');

// CREATE - Add new parking lot (Owner/Admin only)
exports.createParkingLot = async (req, res) => {
  try {
    const {
      name,
      location,
      description,
      total_spaces,
      price_per_hour,
      latitude,
      longitude,
      features,
      is_24_hours,
      opening_time,
      closing_time
    } = req.body;

    const owner_id = req.user.id;

    // Validation
    if (!name || !location || !total_spaces || !price_per_hour) {
      return res.status(400).json({ 
        error: 'Name, location, total spaces, and price per hour are required' 
      });
    }

    if (total_spaces < 1 || price_per_hour < 0) {
      return res.status(400).json({ 
        error: 'Total spaces must be at least 1 and price must be non-negative' 
      });
    }

    // Create parking lot
    const { data: parkingLot, error } = await supabase
      .from('parking_lots')
      .insert([{
        name,
        location,
        description,
        total_spaces,
        available_spaces: total_spaces, // Initially all spaces are available
        price_per_hour,
        latitude,
        longitude,
        features: features || [],
        is_24_hours: is_24_hours || false,
        opening_time: is_24_hours ? null : opening_time,
        closing_time: is_24_hours ? null : closing_time,
        owner_id,
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      console.error('Create parking lot error:', error);
      return res.status(500).json({ error: 'Failed to create parking lot' });
    }

    res.status(201).json({
      message: 'Parking lot created successfully',
      parkingLot
    });

  } catch (err) {
    console.error('Create parking lot error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// READ - Get all parking lots (with filters)
exports.getAllParkingLots = async (req, res) => {
  try {
    const { 
      location, 
      min_price, 
      max_price, 
      features, 
      available_only = 'true',
      limit = 50,
      offset = 0 
    } = req.query;

    let query = supabase
      .from('parking_lots')
      .select('*')
      .eq('is_active', true);

    // Apply filters
    if (location) {
      query = query.or(`name.ilike.%${location}%,location.ilike.%${location}%`);
    }

    if (min_price) {
      query = query.gte('price_per_hour', parseFloat(min_price));
    }

    if (max_price) {
      query = query.lte('price_per_hour', parseFloat(max_price));
    }

    if (available_only === 'true') {
      query = query.gt('available_spaces', 0);
    }

    if (features) {
      const featureArray = features.split(',');
      query = query.contains('features', featureArray);
    }

    // Apply pagination
    query = query
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)
      .order('available_spaces', { ascending: false });

    const { data: parkingLots, error, count } = await query;

    if (error) {
      console.error('Get parking lots error:', error);
      return res.status(500).json({ error: 'Failed to fetch parking lots' });
    }

    res.json({
      parkingLots,
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (err) {
    console.error('Get parking lots error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// READ - Get single parking lot by ID
exports.getParkingLotById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: parkingLot, error } = await supabase
      .from('parking_lots')
      .select(`
        *,
        users!parking_lots_owner_id_fkey (
          full_name,
          email,
          phone_number
        )
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error || !parkingLot) {
      return res.status(404).json({ error: 'Parking lot not found' });
    }

    res.json(parkingLot);

  } catch (err) {
    console.error('Get parking lot error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// READ - Get parking lots owned by current user
exports.getMyParkingLots = async (req, res) => {
  try {
    const owner_id = req.user.id;

    const { data: parkingLots, error } = await supabase
      .from('parking_lots')
      .select('*')
      .eq('owner_id', owner_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get my parking lots error:', error);
      return res.status(500).json({ error: 'Failed to fetch your parking lots' });
    }

    res.json(parkingLots);

  } catch (err) {
    console.error('Get my parking lots error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// UPDATE - Update parking lot (Owner only)
exports.updateParkingLot = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      location,
      description,
      total_spaces,
      price_per_hour,
      latitude,
      longitude,
      features,
      is_24_hours,
      opening_time,
      closing_time,
      is_active
    } = req.body;

    const user_id = req.user.id;
    const user_role = req.user.role;

    // Check if parking lot exists and user has permission
    const { data: existingLot, error: fetchError } = await supabase
      .from('parking_lots')
      .select('owner_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingLot) {
      return res.status(404).json({ error: 'Parking lot not found' });
    }

    // Check ownership (owner can edit their own, admin can edit any)
    if (user_role !== 'admin' && existingLot.owner_id !== user_id) {
      return res.status(403).json({ error: 'You can only edit your own parking lots' });
    }

    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (location !== undefined) updateData.location = location;
    if (description !== undefined) updateData.description = description;
    if (total_spaces !== undefined) {
      if (total_spaces < 1) {
        return res.status(400).json({ error: 'Total spaces must be at least 1' });
      }
      updateData.total_spaces = total_spaces;
    }
    if (price_per_hour !== undefined) {
      if (price_per_hour < 0) {
        return res.status(400).json({ error: 'Price must be non-negative' });
      }
      updateData.price_per_hour = price_per_hour;
    }
    if (latitude !== undefined) updateData.latitude = latitude;
    if (longitude !== undefined) updateData.longitude = longitude;
    if (features !== undefined) updateData.features = features;
    if (is_24_hours !== undefined) {
      updateData.is_24_hours = is_24_hours;
      if (is_24_hours) {
        updateData.opening_time = null;
        updateData.closing_time = null;
      }
    }
    if (!is_24_hours) {
      if (opening_time !== undefined) updateData.opening_time = opening_time;
      if (closing_time !== undefined) updateData.closing_time = closing_time;
    }
    if (is_active !== undefined) updateData.is_active = is_active;

    updateData.updated_at = new Date().toISOString();

    // Update parking lot
    const { data: updatedLot, error } = await supabase
      .from('parking_lots')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update parking lot error:', error);
      return res.status(500).json({ error: 'Failed to update parking lot' });
    }

    res.json({
      message: 'Parking lot updated successfully',
      parkingLot: updatedLot
    });

  } catch (err) {
    console.error('Update parking lot error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE - Delete/Deactivate parking lot (Owner/Admin only)
exports.deleteParkingLot = async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent = false } = req.query;
    
    const user_id = req.user.id;
    const user_role = req.user.role;

    // Check if parking lot exists and user has permission
    const { data: existingLot, error: fetchError } = await supabase
      .from('parking_lots')
      .select('owner_id, name')
      .eq('id', id)
      .single();

    if (fetchError || !existingLot) {
      return res.status(404).json({ error: 'Parking lot not found' });
    }

    // Check ownership (owner can delete their own, admin can delete any)
    if (user_role !== 'admin' && existingLot.owner_id !== user_id) {
      return res.status(403).json({ error: 'You can only delete your own parking lots' });
    }

    // Check for active bookings
    const { data: activeBookings, error: bookingError } = await supabase
      .from('bookings')
      .select('id')
      .eq('parking_lot_id', id)
      .eq('status', 'active')
      .gte('end_time', new Date().toISOString());

    if (bookingError) {
      console.error('Check active bookings error:', bookingError);
      return res.status(500).json({ error: 'Failed to check active bookings' });
    }

    if (activeBookings && activeBookings.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete parking lot with active bookings. Please wait for bookings to complete or cancel them first.' 
      });
    }

    let result;
    if (permanent === 'true' && user_role === 'admin') {
      // Permanent deletion (admin only)
      const { error } = await supabase
        .from('parking_lots')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete parking lot error:', error);
        return res.status(500).json({ error: 'Failed to delete parking lot' });
      }

      result = { message: 'Parking lot permanently deleted' };
    } else {
      // Soft delete (deactivate)
      const { data: updatedLot, error } = await supabase
        .from('parking_lots')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Deactivate parking lot error:', error);
        return res.status(500).json({ error: 'Failed to deactivate parking lot' });
      }

      result = { 
        message: 'Parking lot deactivated successfully',
        parkingLot: updatedLot
      };
    }

    res.json(result);

  } catch (err) {
    console.error('Delete parking lot error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// UTILITY - Get parking lot statistics (Owner/Admin)
exports.getParkingLotStats = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const user_role = req.user.role;

    // Check if parking lot exists and user has permission
    const { data: existingLot, error: fetchError } = await supabase
      .from('parking_lots')
      .select('owner_id, name, total_spaces, available_spaces')
      .eq('id', id)
      .single();

    if (fetchError || !existingLot) {
      return res.status(404).json({ error: 'Parking lot not found' });
    }

    // Check ownership (owner can view their own stats, admin can view any)
    if (user_role !== 'admin' && existingLot.owner_id !== user_id) {
      return res.status(403).json({ error: 'You can only view stats for your own parking lots' });
    }

    // Get booking statistics
    const { data: bookingStats, error: statsError } = await supabase
      .from('bookings')
      .select('status, total_cost, created_at')
      .eq('parking_lot_id', id);

    if (statsError) {
      console.error('Get booking stats error:', statsError);
      return res.status(500).json({ error: 'Failed to fetch statistics' });
    }

    // Calculate statistics
    const totalBookings = bookingStats.length;
    const activeBookings = bookingStats.filter(b => b.status === 'active').length;
    const completedBookings = bookingStats.filter(b => b.status === 'completed').length;
    const cancelledBookings = bookingStats.filter(b => b.status === 'cancelled').length;
    const totalRevenue = bookingStats
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + parseFloat(b.total_cost || 0), 0);

    // Get recent bookings (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentBookings = bookingStats.filter(
      b => new Date(b.created_at) >= thirtyDaysAgo
    ).length;

    const occupancyRate = existingLot.total_spaces > 0 
      ? ((existingLot.total_spaces - existingLot.available_spaces) / existingLot.total_spaces * 100).toFixed(2)
      : 0;

    res.json({
      parkingLot: {
        id,
        name: existingLot.name,
        totalSpaces: existingLot.total_spaces,
        availableSpaces: existingLot.available_spaces,
        occupancyRate: `${occupancyRate}%`
      },
      bookingStats: {
        totalBookings,
        activeBookings,
        completedBookings,
        cancelledBookings,
        recentBookings,
        totalRevenue: totalRevenue.toFixed(2)
      }
    });

  } catch (err) {
    console.error('Get parking lot stats error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = exports;