import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

const APPROVER_LABELS = {
  manager: 'Manager', department_head: 'Department Head', ceo: 'CEO', admin: 'Admin',
};

function Field({ label, children }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <div className="text-sm text-gray-800">{children}</div>
    </div>
  );
}

export default function RequestDetail() {
  const { id }    = useParams();
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [request, setRequest]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(null); // 'approve' | 'reject'
  const [comments, setComments]   = useState('');
  const [acting, setActing]       = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get(`/requests/${id}`);
      setRequest(data);
    } catch {
      navigate('/requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleAction = async (action) => {
    setActing(true);
    try {
      await api.post(`/requests/${id}/${action}`, { comments });
      setModal(null);
      setComments('');
      await load();
    } catch (err) {
      alert(err.response?.data?.error || 'Action failed');
    } finally {
      setActing(false);
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-400">Loading…</div>;
  if (!request) return null;

  const canApprove = ['admin', 'ceo', 'department_head', 'manager'].includes(user.role)
    && request.status === 'pending'
    && (user.role === 'admin' || request.current_approver_role === user.role);

  const canCancel = request.status === 'pending'
    && (request.requester_id === user.id || user.role === 'admin');

  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="text-indigo-600 text-sm hover:underline mb-5 flex items-center gap-1">
        ← Back to requests
      </button>

      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{request.title}</h2>
          <p className="text-gray-500 text-sm mt-1">Request #{request.id} &bull; {request.category}</p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-5">Request Details</h3>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Amount</p>
                <p className="text-3xl font-bold text-gray-900">${Number(request.amount).toLocaleString()}</p>
              </div>
              <Field label="Category">{request.category}</Field>
              <Field label="Submitted by">
                <p>{request.requester_name}</p>
                <p className="text-gray-400 text-xs">{request.department}</p>
              </Field>
              <Field label="Date submitted">{new Date(request.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Field>
              {request.status === 'pending' && request.current_approver_role && (
                <Field label="Awaiting approval from">
                  <span className="text-yellow-700 font-medium">{APPROVER_LABELS[request.current_approver_role]}</span>
                </Field>
              )}
            </div>
            {request.description && (
              <div className="mt-5 pt-5 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Description</p>
                <p className="text-sm text-gray-700 leading-relaxed">{request.description}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Approval History</h3>
            {!request.history?.length ? (
              <p className="text-sm text-gray-400">No actions taken yet.</p>
            ) : (
              <div className="space-y-4">
                {request.history.map((h) => (
                  <div key={h.id} className="flex gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                      h.action === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {h.action === 'approved' ? '✓' : '✗'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium text-gray-900">{h.approver_name}</span>
                        <span className="text-gray-400"> ({APPROVER_LABELS[h.approver_role] ?? h.approver_role})</span>
                        {' — '}
                        <span className={h.action === 'approved' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                          {h.action}
                        </span>
                      </p>
                      {h.comments && <p className="text-sm text-gray-500 mt-1 italic">"{h.comments}"</p>}
                      <p className="text-xs text-gray-400 mt-0.5">{new Date(h.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {(canApprove || canCancel) && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-2">
                {canApprove && (
                  <>
                    <button
                      onClick={() => setModal('approve')}
                      className="w-full py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
                    >
                      ✓ Approve Request
                    </button>
                    <button
                      onClick={() => setModal('reject')}
                      className="w-full py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
                    >
                      ✗ Reject Request
                    </button>
                  </>
                )}
                {canCancel && (
                  <button
                    onClick={() => handleAction('cancel')}
                    disabled={acting}
                    className="w-full py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-60"
                  >
                    Cancel Request
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 text-xs text-gray-500 space-y-2">
            <p><strong>Request ID:</strong> #{request.id}</p>
            <p><strong>Created:</strong> {new Date(request.created_at).toLocaleString()}</p>
            <p><strong>Updated:</strong> {new Date(request.updated_at).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {modal === 'approve' ? '✅ Approve Request' : '❌ Reject Request'}
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              {modal === 'approve'
                ? 'This will mark the request as approved.'
                : 'This will mark the request as rejected. A reason helps the requester understand why.'}
            </p>
            <textarea
              value={comments}
              onChange={e => setComments(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={3}
              placeholder="Add comments (optional)…"
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
                onClick={() => handleAction(modal)}
                disabled={acting}
                className={`flex-1 py-2 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 ${
                  modal === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {acting ? 'Processing…' : (modal === 'approve' ? 'Approve' : 'Reject')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
