import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

const ROLE_LABELS = {
  admin: 'Administrator', ceo: 'CEO',
  department_head: 'Department Head', manager: 'Manager', employee: 'Employee',
};

function StatCard({ label, value, sub, color }) {
  const colors = {
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-900',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    green:  'bg-green-50  border-green-200  text-green-900',
    red:    'bg-red-50    border-red-200    text-red-900',
  };
  return (
    <div className={`rounded-xl border p-5 ${colors[color]}`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm font-medium mt-1">{label}</p>
      {sub && <p className="text-xs opacity-70 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [requests, setRequests]   = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [reqRes, statsRes] = await Promise.all([
          api.get('/requests'),
          user.role === 'admin' ? api.get('/admin/stats') : Promise.resolve(null),
        ]);
        setRequests(reqRes.data);
        if (statsRes) setAdminStats(statsRes.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user.role]);

  const pending  = requests.filter(r => r.status === 'pending').length;
  const approved = requests.filter(r => r.status === 'approved').length;
  const rejected = requests.filter(r => r.status === 'rejected').length;
  const recent   = requests.slice(0, 6);

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}</h2>
        <p className="text-gray-500 text-sm">{ROLE_LABELS[user?.role]} &bull; {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Requests" value={adminStats?.total_requests ?? requests.length} color="indigo" />
        <StatCard label="Pending"        value={adminStats?.pending  ?? pending}  color="yellow" />
        <StatCard label="Approved"       value={adminStats?.approved ?? approved} color="green" />
        <StatCard label="Rejected"       value={adminStats?.rejected ?? rejected} color="red" />
      </div>

      {adminStats && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase">Total Approved Value</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">${Number(adminStats.total_approved_amount).toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase">Total Users</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{adminStats.total_users}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Link
          to="/requests/new"
          className="flex items-center gap-4 p-5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
        >
          <span className="text-3xl">➕</span>
          <div>
            <p className="font-semibold">New Purchase Request</p>
            <p className="text-indigo-200 text-sm">Submit for approval</p>
          </div>
        </Link>
        {['admin', 'ceo', 'department_head', 'manager'].includes(user?.role) && (
          <Link
            to="/approvals"
            className="flex items-center gap-4 p-5 bg-white border-2 border-indigo-200 text-indigo-700 rounded-xl hover:border-indigo-400 transition-colors"
          >
            <span className="text-3xl">✅</span>
            <div>
              <p className="font-semibold">Review Pending Approvals</p>
              <p className="text-gray-500 text-sm">Approve or reject requests</p>
            </div>
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Recent Requests</h3>
          <Link to="/requests" className="text-indigo-600 text-sm hover:underline">View all →</Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading…</div>
        ) : recent.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No requests yet. <Link to="/requests/new" className="text-indigo-600 underline">Create one</Link>.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recent.map(req => (
              <Link key={req.id} to={`/requests/${req.id}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900">{req.title}</p>
                  <p className="text-xs text-gray-400">{req.category} &bull; {new Date(req.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className="text-sm font-semibold text-gray-700">${Number(req.amount).toLocaleString()}</span>
                  <StatusBadge status={req.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
