import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Building2, Mail, Lock, ChevronRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DEMO_ACCOUNTS = [
  { role: 'Admin',       email: 'admin@company.com',    password: 'admin123',    color: 'bg-purple-100 text-purple-700' },
  { role: 'CEO',         email: 'ceo@company.com',      password: 'password123', color: 'bg-yellow-100 text-yellow-700' },
  { role: 'Dept Head',   email: 'depthead@company.com', password: 'password123', color: 'bg-blue-100   text-blue-700'   },
  { role: 'Manager',     email: 'manager@company.com',  password: 'password123', color: 'bg-green-100  text-green-700'  },
  { role: 'Employee',    email: 'alice@company.com',    password: 'password123', color: 'bg-gray-100   text-gray-700'   },
];

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { user, login } = useAuth();
  const navigate         = useNavigate();

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-800 to-indigo-600 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-700/30 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header band */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-8 py-6 text-center">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Purchase Approval System</h1>
            <p className="text-indigo-200 text-sm mt-0.5">Sign in to your account</p>
          </div>

          <div className="px-8 py-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="you@company.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? 'Signing in…' : <>Sign In <ChevronRight className="w-4 h-4" /></>}
              </button>
            </form>

            <div className="mt-5 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Quick access — demo accounts</p>
              <div className="space-y-1">
                {DEMO_ACCOUNTS.map(({ role, email: em, password: pw, color }) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => { setEmail(em); setPassword(pw); }}
                    className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${color}`}>{role}</span>
                    <span className="text-xs text-gray-400 group-hover:text-gray-600 transition-colors">{em}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-indigo-300 text-xs mt-4">
          Vendor?{' '}
          <a href="/vendor/login" className="text-white font-medium hover:underline">Sign in to Vendor Portal →</a>
        </p>
      </div>
    </div>
  );
}
