import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VendorAuthProvider, useVendorAuth } from './context/VendorAuthContext';
import Layout from './components/Layout';
import VendorLayout from './components/VendorLayout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Requests from './pages/Requests';
import NewRequest from './pages/NewRequest';
import RequestDetail from './pages/RequestDetail';
import PendingApprovals from './pages/PendingApprovals';
import AdminPanel from './pages/AdminPanel';
import Requirements from './pages/Requirements';
import NewRequirement from './pages/NewRequirement';
import RequirementDetail from './pages/RequirementDetail';
import QuoteComparison from './pages/QuoteComparison';
import Vendors from './pages/Vendors';

import VendorRegister from './pages/vendor/VendorRegister';
import VendorLogin from './pages/vendor/VendorLogin';
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorTenders from './pages/vendor/VendorTenders';
import VendorTenderDetail from './pages/vendor/VendorTenderDetail';

// ── Auth guards ─────────────────────────────────────────────────────────────
// Use Outlet so these work as layout routes (React Router v6 pattern)

function RequireAuth({ roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

function RequireVendorAuth() {
  const { vendor, loading } = useVendorAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!vendor) return <Navigate to="/vendor/login" replace />;
  return <Outlet />;
}

// ── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <VendorAuthProvider>
          <Routes>
            {/* ── Public ─────────────────────────────────── */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/vendor/login"    element={<VendorLogin />} />
            <Route path="/vendor/register" element={<VendorRegister />} />

            {/* ── Vendor Portal ───────────────────────────── */}
            <Route element={<RequireVendorAuth />}>
              <Route element={<VendorLayout />}>
                <Route path="/vendor/dashboard"   element={<VendorDashboard />} />
                <Route path="/vendor/tenders"     element={<VendorTenders />} />
                <Route path="/vendor/tenders/:id" element={<VendorTenderDetail />} />
              </Route>
            </Route>

            {/* ── Internal App (all roles) ─────────────────── */}
            <Route element={<RequireAuth />}>
              <Route element={<Layout />}>
                <Route path="/dashboard"                      element={<Dashboard />} />
                <Route path="/requests"                       element={<Requests />} />
                <Route path="/requests/new"                   element={<NewRequest />} />
                <Route path="/requests/:id"                   element={<RequestDetail />} />
                <Route path="/requirements"                   element={<Requirements />} />
                <Route path="/requirements/new"               element={<NewRequirement />} />
                <Route path="/requirements/:id"               element={<RequirementDetail />} />
                <Route path="/requirements/:id/comparison"    element={<QuoteComparison />} />

                {/* Approver-only */}
                <Route element={<RequireAuth roles={['admin','ceo','department_head','manager']} />}>
                  <Route path="/approvals" element={<PendingApprovals />} />
                </Route>

                {/* Admin-only */}
                <Route element={<RequireAuth roles={['admin']} />}>
                  <Route path="/vendors" element={<Vendors />} />
                  <Route path="/admin"   element={<AdminPanel />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </VendorAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
