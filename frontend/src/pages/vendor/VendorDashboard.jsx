import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, FileSearch, Calendar, ArrowRight, Tag } from 'lucide-react';
import api from '../../api';
import { useVendorAuth } from '../../context/VendorAuthContext';

export default function VendorDashboard() {
  const { vendor }            = useVendorAuth();
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tenders').then(({ data }) => setTenders(data)).finally(() => setLoading(false));
  }, []);

  const openTenders = tenders.filter(t => t.status === 'open');

  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-7">
        <h2 className="text-2xl font-bold text-gray-900">Welcome, {vendor?.company_name}</h2>
        <p className="text-gray-500 text-sm mt-0.5">Vendor Portal — browse tenders and submit your quotes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
            <FileSearch className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{openTenders.length}</p>
            <p className="text-sm text-gray-500 font-medium">Open Tenders</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <ClipboardList className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{tenders.length}</p>
            <p className="text-sm text-gray-500 font-medium">Total Tenders</p>
          </div>
        </div>
      </div>

      {/* Quick Action */}
      <Link to="/vendor/tenders"
        className="group flex items-center gap-4 p-5 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-2xl hover:from-teal-700 hover:to-teal-600 transition-all shadow-md hover:shadow-lg mb-6">
        <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <ClipboardList className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <p className="font-bold">Browse Open Tenders</p>
          <p className="text-teal-200 text-sm">View requirements and submit your quotes</p>
        </div>
        <ArrowRight className="w-4 h-4 opacity-60 group-hover:translate-x-1 transition-transform" />
      </Link>

      {/* Latest Tenders */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <FileSearch className="w-4 h-4 text-teal-500" />
          <h3 className="font-bold text-gray-900">Latest Open Tenders</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading…</div>
        ) : openTenders.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No open tenders at the moment</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {openTenders.slice(0, 5).map(t => (
              <Link key={t.id} to={`/vendor/tenders/${t.id}`}
                className="group flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Tag className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-teal-600 transition-colors">{t.title}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      {t.category}
                      {t.deadline && (
                        <><span>·</span><Calendar className="w-3 h-3" /> Due {new Date(t.deadline).toLocaleDateString()}</>
                      )}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-teal-500 transition-colors flex-shrink-0 ml-3" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
