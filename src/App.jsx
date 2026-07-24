import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/landing/LandingPage';
import { API_URL } from './utils/function';
import { io } from 'socket.io-client';
import VenueDetailsPage from './pages/landing/VenueDetailsPage';
import SuperAdminLogin from './pages/superadmin/SuperAdminLogin';
import SuperAdminLayout from './pages/superadmin/SuperAdminLayout';
import Dashboard from './pages/superadmin/Dashboard';
import VendorList from './pages/superadmin/VendorList';
import UserList from './pages/superadmin/UserList';
import PaymentTracking from './pages/superadmin/PaymentTracking';
import HeroSettings from './pages/superadmin/HeroSettings';
import VendorRegistration from './pages/vendor/VendorRegistration';
import Terms from './pages/common/Terms';
import Policy from './pages/common/Policy';
import UserAuthPage from './pages/user/UserAuthPage';
import UserProfilePage from './pages/user/UserProfilePage';
import UserOtpVerificationPage from './pages/user/UserOtpVerificationPage';
import './App.css';

import VendorLayout from './pages/vendor/VendorLayout';
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorProfile from './pages/vendor/VendorProfile';
import VendorAvailability from './pages/vendor/VendorAvailability';
import BookingList from './pages/vendor/BookingList';
import MahalProfile from './pages/vendor/MahalProfile';
import VendorLogin from './pages/vendor/VendorLogin';
import VendorMessages from './pages/vendor/VendorMessages';
import InstallPrompt from './components/InstallPrompt';



import AllVenuesPage from './pages/landing/AllVenuesPage';

import ResourcePage from './pages/landing/ResourcePage';

function App() {
  const [currentSocket, setCurrentSocket] = useState(null);

  useEffect(() => {
    let activeUserId = null;
    let socketInstance = null;

    const interval = setInterval(() => {
      const storedUser = localStorage.getItem('user') || localStorage.getItem('vendor_user');
      let userId = null;
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          userId = parsed.id || parsed._id;
        } catch(e) {}
      }

      if (userId !== activeUserId) {
        activeUserId = userId;
        if (socketInstance) {
          socketInstance.close();
          socketInstance = null;
        }
        if (userId) {
          socketInstance = io(API_URL.replace('/api', ''));
          socketInstance.on('connect', () => {
            socketInstance.emit('join', userId);
          });
        }
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      if (socketInstance) socketInstance.close();
    };
  }, []);

  return (
    <BrowserRouter>
      <InstallPrompt />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/venue/:id" element={<VenueDetailsPage />} />
        <Route path="/all-venues" element={<AllVenuesPage />} />
        <Route path="/superadmin/login" element={<SuperAdminLogin />} />
        <Route path="/vendor/login" element={<VendorLogin />} />
        <Route path="/vendor/register" element={<VendorRegistration />} />
        <Route path="/user/login" element={<UserAuthPage defaultView="login" />} />
        <Route path="/user/register" element={<UserAuthPage defaultView="register" />} />
        <Route path="/user/verify-otp" element={<UserOtpVerificationPage />} />
        <Route path="/user/profile" element={<UserProfilePage />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/policy" element={<Policy />} />
        <Route path="/resources/:type" element={<ResourcePage />} />

        {/* Super Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
          <Route path="/superadmin" element={<SuperAdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="vendors" element={<VendorList />} />
            <Route path="users" element={<UserList />} />
            <Route path="payments" element={<PaymentTracking />} />
            <Route path="hero-settings" element={<HeroSettings />} />
          </Route>
        </Route>

        {/* Vendor Routes */}
        <Route element={<ProtectedRoute allowedRoles={['vendor']} />}>
          <Route path="/vendor" element={<VendorLayout />}>
            <Route path="dashboard" element={<VendorDashboard />} />
            <Route path="profile" element={<VendorProfile />} />
            <Route path="mahal-profile" element={<MahalProfile />} />
            <Route path="availability" element={<VendorAvailability />} />
            <Route path="bookings" element={<BookingList />} />
            <Route path="messages" element={<VendorMessages />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
