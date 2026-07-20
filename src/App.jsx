import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Invest from './pages/Invest.jsx';
import Withdraw from './pages/Withdraw.jsx';
import History from './pages/History.jsx';
import KYC from './pages/KYC.jsx';
import Terms from './pages/Terms.jsx';
import AuthRedirect from './pages/AuthRedirect.jsx';
import Admin from './pages/Admin.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import AdminCampaigns from './pages/AdminCampaigns.jsx';
import PageNotFound from '@/lib/PageNotFound.jsx';
import Forbidden from './pages/Forbidden.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/auth-redirect" element={<AuthRedirect />} />
      <Route path="/terms" element={<Terms />} />

      {/* Protected routes - require authentication */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}> 
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/invest" element={<Invest />} />
        <Route path="/withdraw" element={<Withdraw />} />
        <Route path="/history" element={<History />} />
        <Route path="/kyc" element={<KYC />} />

        {/* Admin routes require both authentication and admin role */}
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/campaigns" element={<AdminRoute><AdminCampaigns /></AdminRoute>} />
      </Route>

      <Route path="/403" element={<Forbidden />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}
