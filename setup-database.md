# Complete Setup Guide for Parking Management System

## 🚀 Quick Start

### 1. Supabase Database Setup

1. **Create Supabase Project**
   - Go to [Supabase](https://supabase.com) and create a new project
   - Wait for the project to be ready (usually 2-3 minutes)

2. **Run Database Migrations**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run these migrations in order:

   **Step 1: Master Migration**
   ```sql
   -- Copy and paste the contents of: parking-backend/migrations/00_master_migration_all_tables.sql
   ```

   **Step 2: Availability Triggers**
   ```sql
   -- Copy and paste the contents of: parking-backend/migrations/add_availability_triggers.sql
   ```

   **Step 3: Zimbabwe Parking Locations**
   ```sql
   -- Copy and paste the contents of: parking-backend/migrations/insert_zimbabwe_parking_lots.sql
   ```

   **Step 4: Sample Data (Optional)**
   ```sql
   -- Copy and paste the contents of: parking-backend/migrations/insert_sample_data.sql
   ```

3. **Get Your Supabase Credentials**
   - Go to Settings → API
   - Copy your Project URL and anon public key

### 2. Environment Configuration

**Backend Environment** (`parking-backend/.env`):
```env
# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure

# Server Configuration
PORT=4000
```

**Frontend Environment** (`.env` in root directory):
```env
# Supabase Configuration for Frontend
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API URL
VITE_API_URL=http://localhost:4000
```

> **Important**: Replace the placeholder values with your actual Supabase credentials!

## 3. Install Dependencies

### Frontend
```bash
npm install
```

### Backend
```bash
cd parking-backend
npm install
```

## 4. Start the Application

### Start Backend (Terminal 1)
```bash
cd parking-backend
npm start
```

### Start Frontend (Terminal 2)
```bash
npm run dev
```

## 5. Test the Application

1. Go to `http://localhost:5173` (or the port shown in your terminal)
2. Register a new account
3. Search for parking spaces
4. Try booking a space
5. Check that availability updates correctly

## ✅ Features Now Working

### Core Functionality
- **Real-time parking availability** - Spaces automatically update when booked/cancelled
- **Complete booking flow** - Multi-step booking process with validation
- **User dashboard** - View bookings, search spaces, manage favorites
- **Parking space details** - Full information display with interactive maps
- **Search functionality** - Search by name or location with filters
- **Authentication system** - Secure login/signup with JWT tokens

### Technical Features
- **Database triggers** - Automatic availability updates
- **Backend API** - RESTful endpoints for all operations
- **Frontend integration** - All pages connect to real data
- **Error handling** - Proper error messages and loading states
- **Responsive design** - Works on desktop and mobile
- **Data validation** - Form validation and business logic

### User Experience
- **Availability indicators** - Clear visual indicators for space availability
- **Booking confirmation** - Success messages and redirects
- **Loading states** - Smooth user experience with loading indicators
- **Navigation** - Intuitive routing between pages

## Troubleshooting

### If parking spaces don't show up:
1. Check that the database migrations ran successfully
2. Verify your Supabase connection in the browser console
3. Make sure the backend server is running on port 4000

### If bookings don't work:
1. Ensure you're logged in
2. Check that the JWT token is being stored in localStorage
3. Verify the backend API is accessible

### If availability doesn't update:
1. Check that the database triggers were created successfully
2. Look for any errors in the backend console
3. Verify the booking was created in the database