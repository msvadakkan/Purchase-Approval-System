import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { useVendorAuth } from '../../context/VendorAuthContext';

export default function VendorDashboard() {
  const { vendor }              = useVendorAuth();
  const [tenders, setTenders]   = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get('/tenders').then(({ data }) => setTenders(data)).finally(() => setLoading(false));
  }, []);

  const openTenders = tenders.filter(t => t.status === 'open');

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Welcome, {vendor?.company_name}</h2>
        <p className="text-gray-500 text-sm">Vendor Portal — browse tenders and submit your quotes</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-5">
          <p className="text-3xl font-bold text-teal-700">{openTenders.length}</p>
          <p className="text-sm text-teal-600 font-medium mt-1">Open Tenders</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
          <p className="text-3xl font-bold text-indigo-700">{tenders.length}</p>
          <p className="text-sm text-indigo-600 font-medium mt-1">Total Tenders</p>
        </div>
      </div>

      <Link to="/vendor/tenders"
        className="flex items-center gap-4 p-5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors mb-6">
        <span className="text-3xl">📝</span>
        <div>
          <p className="font-semibold">Browse Open Tenders</p>
          <p className="text-teal-200 text-sm">View requirements and submit your quotes</p>
        </div>
      </Link>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Latest Open Tenders</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading…</div>
        ) : openTenders.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No open tenders at the moment</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {openTenders.slice(0, 5).map(t => (
              <Link key={t.id} to={`/vendor/tenders/${t.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900">{t.title}</p>
                  <p className="text-xs text-gray-400">{t.category} · {t.department}{t.deadline ? ` · Due ${new Date(t.deadline).toLocaleDateString()}` : ''}</p>
                </div>
                <span className="text-teal-600 text-sm font-medium">View →</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
