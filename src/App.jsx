import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import SuperAdminLogin from './pages/superadmin/SuperAdminLogin';
import SuperAdminLayout from './pages/superadmin/SuperAdminLayout';
import Dashboard from './pages/superadmin/Dashboard';
import VendorList from './pages/superadmin/VendorList';
import UserList from './pages/superadmin/UserList';
import PaymentTracking from './pages/superadmin/PaymentTracking';
import VendorRegistration from './pages/vendor/VendorRegistration';
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
        <Route path="/" element={<Navigate to="/superadmin/login" replace />} />
        <Route path="/superadmin/login" element={<SuperAdminLogin />} />
        <Route path="/vendor/register" element={<VendorRegistration />} />

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
