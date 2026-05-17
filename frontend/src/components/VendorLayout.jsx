import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, LogOut, ShoppingBag, ChevronRight } from 'lucide-react';
import { useVendorAuth } from '../context/VendorAuthContext';

function VendorAvatar({ name }) {
  const initials = name ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : 'V';
  return (
    <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
      {initials}
    </div>
  );
}

export default function VendorLayout() {
  const { vendor, logout } = useVendorAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/vendor/login'); };

  const navItems = [
    { to: '/vendor/dashboard', label: 'Dashboard',      Icon: LayoutDashboard },
    { to: '/vendor/tenders',   label: 'Browse Tenders', Icon: ClipboardList },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className="w-64 bg-gradient-to-b from-teal-950 to-teal-900 text-white flex flex-col flex-shrink-0 shadow-xl">

        {/* Logo */}
        <div className="px-5 py-5 border-b border-teal-800/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight tracking-wide">Vendor Portal</h1>
              <p className="text-teal-400 text-[11px] truncate max-w-[140px]">{vendor?.company_name}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <p className="px-3 py-2 text-[10px] font-semibold text-teal-500 uppercase tracking-widest">Navigation</p>
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-teal-300 hover:bg-teal-800/60 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                    isActive ? 'bg-teal-500' : 'bg-teal-800/50 group-hover:bg-teal-700/60'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Footer */}
        <div className="px-3 py-4 border-t border-teal-800/60">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1">
            <VendorAvatar name={vendor?.company_name} />
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate leading-tight">{vendor?.company_name}</p>
              <p className="text-teal-400 text-[11px] truncate">{vendor?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-teal-300 hover:text-white hover:bg-teal-800/60 rounded-xl text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
