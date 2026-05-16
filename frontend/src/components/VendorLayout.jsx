import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useVendorAuth } from '../context/VendorAuthContext';

export default function VendorLayout() {
  const { vendor, logout } = useVendorAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/vendor/login'); };

  const navItems = [
    { to: '/vendor/dashboard', label: 'Dashboard',     icon: '🏠' },
    { to: '/vendor/tenders',   label: 'Browse Tenders', icon: '📝' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className="w-64 bg-teal-900 text-white flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-teal-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center text-lg">🏪</div>
            <div>
              <h1 className="text-sm font-bold leading-tight">Vendor Portal</h1>
              <p className="text-teal-400 text-xs truncate max-w-[140px]">{vendor?.company_name}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                  isActive ? 'bg-teal-700 text-white' : 'text-teal-200 hover:bg-teal-800 hover:text-white'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-teal-800">
          <div className="px-4 py-2 mb-1">
            <p className="text-white font-semibold text-sm truncate">{vendor?.company_name}</p>
            <p className="text-teal-400 text-xs">{vendor?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-teal-300 hover:text-white hover:bg-teal-800 rounded-lg text-sm transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
