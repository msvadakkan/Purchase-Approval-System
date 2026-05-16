import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_LABELS = {
  admin:           'Administrator',
  ceo:             'CEO',
  department_head: 'Department Head',
  manager:         'Manager',
  employee:        'Employee',
};

const APPROVER_ROLES = ['admin', 'ceo', 'department_head', 'manager'];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { to: '/dashboard',    label: 'Dashboard',          icon: '🏠' },
    { to: '/requests',     label: 'Purchase Requests',  icon: '📋' },
    { to: '/requirements', label: 'Requirements',       icon: '📝' },
    ...(APPROVER_ROLES.includes(user?.role)
      ? [{ to: '/approvals', label: 'Pending Approvals', icon: '✅' }]
      : []),
    ...(user?.role === 'admin'
      ? [
          { to: '/vendors', label: 'Vendors',     icon: '🏪' },
          { to: '/admin',   label: 'Admin Panel', icon: '⚙️' },
        ]
      : []),
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className="w-64 bg-indigo-900 text-white flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-indigo-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-lg">🏢</div>
            <div>
              <h1 className="text-sm font-bold leading-tight">Purchase Approval</h1>
              <p className="text-indigo-400 text-xs">Management System</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                  isActive ? 'bg-indigo-700 text-white' : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-indigo-800">
          <div className="px-4 py-2 mb-1">
            <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
            <p className="text-indigo-400 text-xs">{ROLE_LABELS[user?.role]}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-indigo-300 hover:text-white hover:bg-indigo-800 rounded-lg text-sm transition-colors"
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
