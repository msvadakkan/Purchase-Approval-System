import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import StatusBadge from '../components/StatusBadge';

export default function PendingApprovals() {
  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(null); // { id, action }
  const [comments, setComments]   = useState('');
  const [acting, setActing]       = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get('/requests/pending');
      setRequests(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAction = async () => {
    if (!modal) return;
    setActing(true);
    try {
      await api.post(`/requests/${modal.id}/${modal.action}`, { comments });
      setModal(null);
      setComments('');
      await load();
    } catch (err) {
      alert(err.response?.data?.error || 'Action failed');
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Pending Approvals</h2>
        <p className="text-gray-500 text-sm">Review and action purchase requests assigned to your approval level</p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading…</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">✅</p>
          <p className="text-lg font-semibold text-gray-600">All caught up!</p>
          <p className="text-sm mt-1">No pending requests assigned to your level</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-yellow-50 flex items-center gap-2">
            <span className="text-yellow-600 text-sm font-semibold">⏳ {requests.length} request{requests.length !== 1 ? 's' : ''} awaiting your review</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                  {['Request', 'Requester', 'Category', 'Amount', 'Submitted', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {requests.map(req => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 max-w-xs">
                      <Link to={`/requests/${req.id}`} className="text-sm font-medium text-gray-900 hover:text-indigo-600">
                        {req.title}
                      </Link>
                      {req.description && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">{req.description}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-700">{req.requester_name}</p>
                      <p className="text-xs text-gray-400">{req.department}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{req.category}</td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-bold text-gray-900">${Number(req.amount).toLocaleString()}</span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setModal({ id: req.id, action: 'approve' })}
                          className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setModal({ id: req.id, action: 'reject' })}
                          className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {modal.action === 'approve' ? '✅ Approve Request' : '❌ Reject Request'}
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              Add comments before {modal.action === 'approve' ? 'approving' : 'rejecting'} this request.
            </p>
            <textarea
              value={comments}
              onChange={e => setComments(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={3}
              placeholder="Comments (optional)…"
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setModal(null); setComments(''); }}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={acting}
                className={`flex-1 py-2 text-white rounded-lg text-sm font-semibold disabled:opacity-60 transition-colors ${
                  modal.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {acting ? 'Processing…' : (modal.action === 'approve' ? 'Approve' : 'Reject')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
