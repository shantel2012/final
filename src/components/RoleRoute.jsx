// src/components/RoleRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/SimpleAuthContext";

const RoleRoute = ({ allowedRoles, children }) => {
  const { user, loading, getUserRole } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  const userRole = getUserRole();

  if (!allowedRoles.includes(userRole)) {
    // Role not allowed, redirect to appropriate dashboard
    if (userRole === 'admin') {
      return <Navigate to="/dashboard/admin" replace />;
    } else if (userRole === 'owner') {
      return <Navigate to="/dashboard/owner" replace />;
    } else {
      return <Navigate to="/dashboard/user" replace />;
    }
  }

  return children;
};

export default RoleRoute;
