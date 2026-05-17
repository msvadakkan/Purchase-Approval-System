import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Clock, PartyPopper, MessageSquare } from 'lucide-react';
import api from '../api';
import StatusBadge from '../components/StatusBadge';

export default function PendingApprovals() {
  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(null);
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
        <p className="text-gray-500 text-sm mt-0.5">Review and action purchase requests assigned to your approval level</p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading…</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <PartyPopper className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-lg font-bold text-gray-600">All caught up!</p>
          <p className="text-sm text-gray-400 mt-1">No pending requests assigned to your level</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-amber-50 flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-amber-800 text-sm font-semibold">
              {requests.length} request{requests.length !== 1 ? 's' : ''} awaiting your review
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                  {['Request', 'Requester', 'Category', 'Amount', 'Submitted', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {requests.map(req => (
                  <tr key={req.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-5 py-4 max-w-xs">
                      <Link to={`/requests/${req.id}`} className="text-sm font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                        {req.title}
                      </Link>
                      {req.description && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">{req.description}</p>
                      )}
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
                    <td className="px-5 py-4 text-xs text-gray-400">
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setModal({ id: req.id, action: 'approve' })}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => setModal({ id: req.id, action: 'reject' })}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              {modal.action === 'approve' ? (
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
              ) : (
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {modal.action === 'approve' ? 'Approve Request' : 'Reject Request'}
                </h3>
                <p className="text-gray-500 text-sm">
                  Add optional comments before {modal.action === 'approve' ? 'approving' : 'rejecting'}.
                </p>
              </div>
            </div>

            <div className="relative">
              <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
              <textarea
                value={comments}
                onChange={e => setComments(e.target.value)}
                className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                rows={3}
                placeholder="Comments (optional)…"
                autoFocus
              />
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setModal(null); setComments(''); }}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={acting}
                className={`flex-1 py-2.5 text-white rounded-xl text-sm font-semibold disabled:opacity-60 transition-colors flex items-center justify-center gap-2 ${
                  modal.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {acting ? 'Processing…' : (
                  modal.action === 'approve'
                    ? <><CheckCircle2 className="w-4 h-4" /> Approve</>
                    : <><XCircle className="w-4 h-4" /> Reject</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
