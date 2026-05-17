import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, Inbox } from 'lucide-react';
import api from '../api';
import StatusBadge from '../components/StatusBadge';

const FILTERS = ['all', 'pending', 'approved', 'rejected', 'cancelled'];

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');

  useEffect(() => {
    api.get('/requests').then(({ data }) => setRequests(data)).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Purchase Requests</h2>
          <p className="text-gray-500 text-sm mt-0.5">All requests visible to your role</p>
        </div>
        <Link to="/requests/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          New Request
        </Link>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold capitalize transition-colors ${
              filter === f
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-8 h-8 text-gray-400" />
          </div>
          <p className="font-semibold text-gray-500">No {filter === 'all' ? '' : filter} requests found</p>
          <p className="text-sm mt-1">
            <Link to="/requests/new" className="text-indigo-600 font-medium hover:underline">Create a new request</Link>
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                {['Title', 'Requester', 'Category', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(req => (
                <tr key={req.id} className="hover:bg-gray-50/70 transition-colors group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-indigo-500" />
                      </div>
                      <Link to={`/requests/${req.id}`} className="text-sm font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                        {req.title}
                      </Link>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-gray-700">{req.requester_name}</p>
                    <p className="text-xs text-gray-400">{req.department}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">{req.category}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-bold text-gray-900">${Number(req.amount).toLocaleString()}</span>
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={req.status} /></td>
                  <td className="px-5 py-4 text-xs text-gray-400">{new Date(req.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
