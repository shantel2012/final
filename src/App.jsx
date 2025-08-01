// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import TestComponent from "./components/TestComponent";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import UserDashboard from "./pages/UserDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ParkingDetails from "./pages/ParkingDetails";
import BookingPage from "./pages/BookingPage";
import HowitWorks from "./pages/Howitworks";
import ListSpace from "./pages/ListSpace";
import Search from "./pages/Search";
import ProfilePage from "./pages/ProfilePage";
import MapDemo from "./components/MapDemo";
import { AuthProvider } from "./contexts/SimpleAuthContext";
import RoleRoute from "./components/RoleRoute";

const App = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          {/* Test route */}
          <Route path="/test" element={<TestComponent />} />
          
          {/* Map Demo route */}
          <Route path="/map-demo" element={<MapDemo />} />
          
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/how-it-works" element={<HowitWorks />} />
          <Route path="/search" element={<Search />} />

          {/* Dashboard routes - temporarily without role protection */}
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/owner-dashboard" element={<OwnerDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/dashboard/user" element={<UserDashboard />} />
          <Route path="/dashboard/owner" element={<OwnerDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />

          {/* Parking & booking */}
          <Route path="/parking/:id" element={<ParkingDetails />} />
          <Route path="/booking/:id" element={<BookingPage />} />

          {/* Owner list space */}
          <Route path="/owner/list-space" element={<ListSpace />} />
          <Route path="/list-space" element={<ListSpace />} />

          {/* Profile Page route */}
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </div>
    </AuthProvider>
  );
};

export default App;
