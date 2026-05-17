import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VendorAuthProvider, useVendorAuth } from './context/VendorAuthContext';
import { CompanyProvider } from './context/CompanyContext';
import Layout from './components/Layout';
import VendorLayout from './components/VendorLayout';

// Lazy-loaded pages — code-split per route for fast initial load
const Login            = lazy(() => import('./pages/Login'));
const Dashboard        = lazy(() => import('./pages/Dashboard'));
const Requests         = lazy(() => import('./pages/Requests'));
const NewRequest       = lazy(() => import('./pages/NewRequest'));
const RequestDetail    = lazy(() => import('./pages/RequestDetail'));
const PendingApprovals = lazy(() => import('./pages/PendingApprovals'));
const AdminPanel       = lazy(() => import('./pages/AdminPanel'));
const Requirements     = lazy(() => import('./pages/Requirements'));
const NewRequirement   = lazy(() => import('./pages/NewRequirement'));
const RequirementDetail= lazy(() => import('./pages/RequirementDetail'));
const QuoteComparison  = lazy(() => import('./pages/QuoteComparison'));
const Vendors          = lazy(() => import('./pages/Vendors'));
const Companies        = lazy(() => import('./pages/Companies'));
const NewCompany       = lazy(() => import('./pages/NewCompany'));
const LPOs             = lazy(() => import('./pages/LPOs'));
const NewLPO           = lazy(() => import('./pages/NewLPO'));
const LPODetail        = lazy(() => import('./pages/LPODetail'));

const VendorLogin      = lazy(() => import('./pages/vendor/VendorLogin'));
const VendorRegister   = lazy(() => import('./pages/vendor/VendorRegister'));
const VendorDashboard  = lazy(() => import('./pages/vendor/VendorDashboard'));
const VendorTenders    = lazy(() => import('./pages/vendor/VendorTenders'));
const VendorTenderDetail= lazy(() => import('./pages/vendor/VendorTenderDetail'));

// ── Shared spinner ───────────────────────────────────────────────────────────
function Spinner({ color = 'indigo' }) {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className={`w-8 h-8 border-4 border-${color}-600 border-t-transparent rounded-full animate-spin`} />
    </div>
  );
}

// ── Auth guards (Outlet pattern — React Router v6) ───────────────────────────
function RequireAuth({ roles }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

function RequireVendorAuth() {
  const { vendor, loading } = useVendorAuth();
  if (loading) return <Spinner color="teal" />;
  if (!vendor) return <Navigate to="/vendor/login" replace />;
  return <Outlet />;
}

// ── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <VendorAuthProvider>
          <CompanyProvider>
            <Suspense fallback={<Spinner />}>
              <Routes>
                {/* ── Public ───────────────────────────────── */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/login"           element={<Login />} />
                <Route path="/vendor/login"    element={<VendorLogin />} />
                <Route path="/vendor/register" element={<VendorRegister />} />

                {/* ── Vendor Portal ─────────────────────────── */}
                <Route element={<RequireVendorAuth />}>
                  <Route element={<VendorLayout />}>
                    <Route path="/vendor/dashboard"   element={<VendorDashboard />} />
                    <Route path="/vendor/tenders"     element={<VendorTenders />} />
                    <Route path="/vendor/tenders/:id" element={<VendorTenderDetail />} />
                  </Route>
                </Route>

                {/* ── Internal App (all roles) ───────────────── */}
                <Route element={<RequireAuth />}>
                  <Route element={<Layout />}>
                    <Route path="/dashboard"                   element={<Dashboard />} />
                    <Route path="/requests"                    element={<Requests />} />
                    <Route path="/requests/new"                element={<NewRequest />} />
                    <Route path="/requests/:id"                element={<RequestDetail />} />
                    <Route path="/requirements"                element={<Requirements />} />
                    <Route path="/requirements/new"            element={<NewRequirement />} />
                    <Route path="/requirements/:id"            element={<RequirementDetail />} />
                    <Route path="/requirements/:id/comparison" element={<QuoteComparison />} />
                    <Route path="/lpos"                        element={<LPOs />} />
                    <Route path="/lpos/new"                    element={<NewLPO />} />
                    <Route path="/lpos/:id"                    element={<LPODetail />} />
                    <Route path="/companies"                   element={<Companies />} />
                    <Route path="/companies/new"               element={<NewCompany />} />

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
            </Suspense>
          </CompanyProvider>
        </VendorAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
