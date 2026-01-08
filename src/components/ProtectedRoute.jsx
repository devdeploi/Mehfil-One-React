import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
    const storedUser = localStorage.getItem('vendor_user');
    const user = storedUser ? JSON.parse(storedUser) : null;

    if (!user) {
        return <Navigate to="/superadmin/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect based on role if they try to access unauthorized route
        if (user.role === 'superadmin') {
            return <Navigate to="/superadmin/dashboard" replace />;
        } else {
            return <Navigate to="/vendor/dashboard" replace />;
        }
    }

    return <Outlet />;
};

export default ProtectedRoute;
