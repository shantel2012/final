# 🔧 Database Troubleshooting Guide

## 🚨 Common Issues & Solutions

### **Issue 1: Table doesn't exist**
**Error**: `relation "parking_lots" does not exist`

**Solution**:
```sql
-- Run the table creation script first
\i parking-backend/migrations/create_parking_lots_table.sql
```

### **Issue 2: Permission denied**
**Error**: `permission denied for table parking_lots`

**Solutions**:
1. **Check if you're authenticated in Supabase**:
   - Make sure you're logged into your Supabase dashboard
   - Use the SQL Editor in Supabase dashboard, not a local client

2. **Disable RLS temporarily** (if needed):
   ```sql
   ALTER TABLE parking_lots DISABLE ROW LEVEL SECURITY;
   -- Run your updates
   ALTER TABLE parking_lots ENABLE ROW LEVEL SECURITY;
   ```

3. **Use service role key** (for admin operations):
   - In Supabase dashboard, go to Settings > API
   - Use the `service_role` key for admin operations

### **Issue 3: Column doesn't exist**
**Error**: `column "latitude" does not exist`

**Solution**:
```sql
-- Add missing columns
ALTER TABLE parking_lots ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8);
ALTER TABLE parking_lots ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);
```

### **Issue 4: Data type mismatch**
**Error**: `invalid input syntax for type numeric`

**Solution**:
```sql
-- Ensure coordinates are numeric, not text
UPDATE parking_lots SET 
  latitude = CAST(latitude AS DECIMAL(10,8)),
  longitude = CAST(longitude AS DECIMAL(11,8))
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
```

## 🔍 Step-by-Step Debugging Process

### **Step 1: Run Diagnostics**
```sql
-- Copy and run DIAGNOSE_DATABASE.sql in Supabase SQL Editor
\i DIAGNOSE_DATABASE.sql
```

### **Step 2: Check Results**
Look for these key indicators:
- ✅ `parking_lots table EXISTS`
- ✅ `latitude column EXISTS`
- ✅ `longitude column EXISTS`
- ✅ `total_parking_lots > 0`

### **Step 3: Run Minimal Update**
```sql
-- Copy and run MINIMAL_COORDINATE_UPDATE.sql
\i MINIMAL_COORDINATE_UPDATE.sql
```

### **Step 4: Verify Success**
```sql
SELECT name, latitude, longitude 
FROM parking_lots 
WHERE latitude IS NOT NULL 
LIMIT 5;
```

## 🛠️ Manual Fix Options

### **Option A: Use Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to "Table Editor"
3. Select `parking_lots` table
4. Manually edit latitude/longitude columns for each row

### **Option B: Use Safe Update Script**
```sql
-- Run this in Supabase SQL Editor
UPDATE parking_lots 
SET 
  latitude = CASE 
    WHEN location ILIKE '%harare%' THEN -17.8292
    WHEN location ILIKE '%bulawayo%' THEN -20.1547
    WHEN location ILIKE '%mutare%' THEN -18.9707
    ELSE -17.8292
  END,
  longitude = CASE 
    WHEN location ILIKE '%harare%' THEN 31.0522
    WHEN location ILIKE '%bulawayo%' THEN 28.5810
    WHEN location ILIKE '%mutare%' THEN 32.6593
    ELSE 31.0522
  END
WHERE latitude IS NULL OR longitude IS NULL;
```

### **Option C: Insert New Sample Data**
```sql
-- If table is empty, insert sample data with coordinates
INSERT INTO parking_lots (name, location, description, total_spaces, available_spaces, price_per_hour, latitude, longitude, is_active, is_24_hours) VALUES
('Harare CBD Parking', 'First Street, Harare', 'Central business district parking', 100, 80, 2.50, -17.8292, 31.0522, true, false),
('Eastgate Mall', 'Eastgate Shopping Centre, Harare', 'Shopping mall parking', 200, 150, 3.00, -17.8640, 31.1470, true, true),
('Bulawayo Centre', 'Fife Street, Bulawayo', 'City centre parking', 150, 120, 2.00, -20.1547, 28.5810, true, false);
```

## 🔐 Permission Issues

### **If you get permission errors:**

1. **Check your role**:
   ```sql
   SELECT current_user, session_user;
   ```

2. **Temporarily disable RLS**:
   ```sql
   ALTER TABLE parking_lots DISABLE ROW LEVEL SECURITY;
   -- Run your updates
   ALTER TABLE parking_lots ENABLE ROW LEVEL SECURITY;
   ```

3. **Create admin policy**:
   ```sql
   CREATE POLICY "Admin full access" ON parking_lots
   FOR ALL USING (true);
   ```

## 🎯 Quick Test

Run this quick test to verify everything works:

```sql
-- Quick verification test
SELECT 
  'Database Status: ' || 
  CASE 
    WHEN COUNT(*) > 0 AND COUNT(latitude) > 0 
    THEN 'READY ✅' 
    ELSE 'NEEDS SETUP ❌' 
  END as status
FROM parking_lots;
```

## 🚀 Next Steps After Fix

1. **Test the map functionality**:
   - Go to `http://localhost:5173/search`
   - Check if parking lots appear on the map

2. **Verify coordinates**:
   - Markers should appear in Zimbabwe (around Harare)
   - Click markers to see parking lot details

3. **Test booking flow**:
   - Click "Book Now" on any parking lot
   - Complete the booking process

## 📞 Still Having Issues?

If you're still experiencing problems:

1. **Check Supabase logs**:
   - Go to Supabase Dashboard > Logs
   - Look for error messages

2. **Verify API connection**:
   - Check `src/supabaseClient.jsx`
   - Ensure correct URL and API keys

3. **Browser console**:
   - Open browser dev tools
   - Check for JavaScript errors

4. **Network tab**:
   - Check if API calls are successful
   - Look for 401/403 errors (authentication issues)

## ✅ Success Indicators

You'll know it's working when:
- ✅ SQL updates run without errors
- ✅ Map shows parking lots in Zimbabwe
- ✅ Clicking markers shows parking details
- ✅ Booking flow works end-to-end
- ✅ No console errors in browser

The map should show parking lots around Harare, Zimbabwe with proper GPS coordinates! 🗺️🇿🇼