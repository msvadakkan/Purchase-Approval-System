import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Clock, CheckCircle2, XCircle, TrendingUp,
  Users, PlusCircle, ClipboardCheck, ArrowRight, Banknote,
} from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

const ROLE_LABELS = {
  admin: 'Administrator', ceo: 'CEO',
  department_head: 'Department Head', manager: 'Manager', employee: 'Employee',
};

function StatCard({ label, value, sub, Icon, iconBg, iconColor, valuColor }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div>
        <p className={`text-2xl font-bold ${valuColor ?? 'text-gray-900'}`}>{value}</p>
        <p className="text-sm text-gray-500 font-medium leading-tight">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [requests, setRequests]     = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [loading, setLoading]       = useState(true);

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
      {/* Header */}
      <div className="mb-7">
        <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}</h2>
        <p className="text-gray-500 text-sm mt-0.5">
          <span className="font-medium text-gray-600">{ROLE_LABELS[user?.role]}</span>
          {' · '}
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Requests" value={adminStats?.total_requests ?? requests.length}
          Icon={FileText}       iconBg="bg-indigo-50"  iconColor="text-indigo-600" />
        <StatCard label="Pending"        value={adminStats?.pending  ?? pending}
          Icon={Clock}          iconBg="bg-yellow-50"  iconColor="text-yellow-600" />
        <StatCard label="Approved"       value={adminStats?.approved ?? approved}
          Icon={CheckCircle2}   iconBg="bg-green-50"   iconColor="text-green-600" />
        <StatCard label="Rejected"       value={adminStats?.rejected ?? rejected}
          Icon={XCircle}        iconBg="bg-red-50"     iconColor="text-red-600" />
      </div>

      {/* Admin Extra Cards */}
      {adminStats && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <Banknote className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Total Approved Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">${Number(adminStats.total_approved_amount).toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{adminStats.total_users}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Link to="/requests/new"
          className="group flex items-center gap-4 p-5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-2xl hover:from-indigo-700 hover:to-indigo-600 transition-all shadow-md hover:shadow-lg">
          <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="font-bold">New Purchase Request</p>
            <p className="text-indigo-200 text-sm">Submit for approval</p>
          </div>
          <ArrowRight className="w-4 h-4 opacity-60 group-hover:translate-x-1 transition-transform" />
        </Link>

        {['admin', 'ceo', 'department_head', 'manager'].includes(user?.role) && (
          <Link to="/approvals"
            className="group flex items-center gap-4 p-5 bg-white border-2 border-indigo-100 text-gray-800 rounded-2xl hover:border-indigo-300 hover:shadow-md transition-all">
            <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <ClipboardCheck className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="flex-1">
              <p className="font-bold">Review Pending Approvals</p>
              <p className="text-gray-500 text-sm">Approve or reject requests</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <h3 className="font-bold text-gray-900">Recent Requests</h3>
          </div>
          <Link to="/requests" className="text-indigo-600 text-sm font-medium hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading…</div>
        ) : recent.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No requests yet.{' '}
            <Link to="/requests/new" className="text-indigo-600 font-medium hover:underline">Create one</Link>.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recent.map(req => (
              <Link key={req.id} to={`/requests/${req.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{req.title}</p>
                    <p className="text-xs text-gray-400">{req.category} · {new Date(req.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                  <span className="text-sm font-bold text-gray-700">${Number(req.amount).toLocaleString()}</span>
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
