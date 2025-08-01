# 🚀 Complete Database Setup Guide for Parking Management System

## Overview
This guide will help you set up your Supabase database correctly so your parking data appears in your localhost application.

## 🔧 Step 1: Supabase Database Setup

### 1.1 Access Your Supabase Project
- Go to [Supabase Dashboard](https://supabase.com/dashboard)
- Open your project: `jlzdmtlefuwzzfhkqeqh`

### 1.2 Get Your Service Role Key
You need to get your service role key for the backend:

1. Go to **Settings** → **API**
2. Copy the **service_role** key (not the anon key)
3. Update your backend `.env` file:

```bash
# Edit: parking-backend/.env
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
```

## 🗄️ Step 2: Create Database Tables

### 2.1 Run Master Migration
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the entire contents of: `parking-backend/migrations/00_master_migration_all_tables.sql`
4. Click **Run** to execute

This will create:
- ✅ `users` table
- ✅ `parking_lots` table  
- ✅ `user_profiles` table
- ✅ `bookings` table
- ✅ All necessary indexes, triggers, and security policies

### 2.2 Insert Sample Parking Data
1. In the same SQL Editor
2. Copy and paste the contents of: `parking-backend/migrations/insert_zimbabwe_parking_lots_fixed.sql`
3. Click **Run** to execute

This will add 25+ parking lots across Zimbabwe including:
- Harare CBD locations
- Borrowdale shopping areas
- Airport parking
- Industrial areas
- And more!

## ⚙️ Step 3: Verify Database Setup

### 3.1 Check Tables Were Created
In SQL Editor, run:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see:
- bookings
- parking_lots
- user_profiles
- users

### 3.2 Check Parking Lots Data
```sql
SELECT name, location, available_spaces, total_spaces, price_per_hour 
FROM parking_lots 
WHERE is_active = true 
LIMIT 10;
```

You should see parking lots like:
- Harare CBD Central Parking
- Eastgate Mall Parking
- Borrowdale Village Shopping Centre
- etc.

## 🚀 Step 4: Start Your Application

### 4.1 Install Dependencies
```bash
# Frontend
npm install

# Backend
cd parking-backend
npm install
```

### 4.2 Start Backend Server
```bash
cd parking-backend
npm start
```
Backend should start on: `http://localhost:4000`

### 4.3 Start Frontend
```bash
# In root directory
npm run dev
```
Frontend should start on: `http://localhost:5173`

## 🔍 Step 5: Test the Connection

### 5.1 Check Backend API
Visit: `http://localhost:4000/api/parking-lots`

You should see JSON data with your parking lots.

### 5.2 Check Frontend
1. Go to: `http://localhost:5173`
2. Navigate to the search/parking lots page
3. You should see the Zimbabwe parking lots displayed

## 🛠️ Troubleshooting

### Issue: "No parking lots found"
**Solution:**
1. Check that the master migration ran successfully
2. Verify parking lots data was inserted
3. Check browser console for API errors
4. Ensure backend server is running on port 4000

### Issue: "Database connection error"
**Solution:**
1. Verify your Supabase URL and keys in both `.env` files
2. Make sure you have the correct service role key
3. Check that RLS policies allow data access

### Issue: "Authentication errors"
**Solution:**
1. The parking lots should be visible without authentication (public data)
2. Check the RLS policy: "Everyone can view active parking lots"

### Issue: "CORS errors"
**Solution:**
1. Make sure backend is running on port 4000
2. Check that VITE_API_URL in frontend .env is correct

## 📋 Environment Files Summary

**Frontend (.env):**
```env
VITE_SUPABASE_URL=https://jlzdmtlefuwzzfhkqeqh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsemRtdGxlZnV3enpmaGtxZXFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NjAxMjgsImV4cCI6MjA2ODEzNjEyOH0.mnYAfg85ZrderkuM1v6wTzYxqvgZUPRI5A3n5mnPl5o
VITE_API_URL=http://localhost:4000
```

**Backend (parking-backend/.env):**
```env
SUPABASE_URL=https://jlzdmtlefuwzzfhkqeqh.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsemRtdGxlZnV3enpmaGtxZXFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NjAxMjgsImV4cCI6MjA2ODEzNjEyOH0.mnYAfg85ZrderkuM1v6wTzYxqvgZUPRI5A3n5mnPl5o
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
JWT_SECRET=parking_management_jwt_secret_key_2024_secure_random_string
PORT=4000
```

## ✅ Success Checklist

- [ ] Master migration executed successfully
- [ ] Parking lots data inserted
- [ ] Service role key added to backend .env
- [ ] Backend server starts without errors
- [ ] Frontend connects to backend API
- [ ] Parking lots visible in the application
- [ ] Can search and view parking lot details

## 🎉 Next Steps

Once your database is working:
1. Test user registration and login
2. Try booking a parking space
3. Check that availability updates in real-time
4. Explore the admin dashboard features

## 📞 Need Help?

If you encounter any issues:
1. Check the browser console for error messages
2. Check the backend server logs
3. Verify all environment variables are set correctly
4. Make sure Supabase project is active and accessible