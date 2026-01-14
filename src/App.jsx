import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/landing/LandingPage';
import SuperAdminLogin from './pages/superadmin/SuperAdminLogin';
import SuperAdminLayout from './pages/superadmin/SuperAdminLayout';
import Dashboard from './pages/superadmin/Dashboard';
import VendorList from './pages/superadmin/VendorList';
import UserList from './pages/superadmin/UserList';
import PaymentTracking from './pages/superadmin/PaymentTracking';
import VendorRegistration from './pages/vendor/VendorRegistration';
import Terms from './pages/common/Terms';
import Policy from './pages/common/Policy';
import './App.css';

import VendorLayout from './pages/vendor/VendorLayout';
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorProfile from './pages/vendor/VendorProfile';
import VendorAvailability from './pages/vendor/VendorAvailability';
import MahalProfile from './pages/vendor/MahalProfile';



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/superadmin/login" element={<SuperAdminLogin />} />
        <Route path="/vendor/register" element={<VendorRegistration />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/policy" element={<Policy />} />

        {/* Super Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
          <Route path="/superadmin" element={<SuperAdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="vendors" element={<VendorList />} />
            <Route path="users" element={<UserList />} />
            <Route path="payments" element={<PaymentTracking />} />
          </Route>
        </Route>

        {/* Vendor Routes */}
        <Route element={<ProtectedRoute allowedRoles={['vendor']} />}>
          <Route path="/vendor" element={<VendorLayout />}>
            <Route path="dashboard" element={<VendorDashboard />} />
            <Route path="profile" element={<VendorProfile />} />
            <Route path="mahal-profile" element={<MahalProfile />} />
            <Route path="availability" element={<VendorAvailability />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
