import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function RequirementDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tender, setTender]   = useState(null);
  const [quotes, setQuotes]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [tRes, qRes] = await Promise.all([
          api.get(`/tenders/${id}`),
          api.get(`/tenders/${id}/quotes`),
        ]);
        setTender(tRes.data);
        setQuotes(qRes.data);
      } catch {
        navigate('/requirements');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleClose = async () => {
    setClosing(true);
    await api.put(`/tenders/${id}`, { status: tender.status === 'open' ? 'closed' : 'open' });
    const { data } = await api.get(`/tenders/${id}`);
    setTender(data);
    setClosing(false);
  };

  if (loading) return <div className="p-6 text-center text-gray-400">Loading…</div>;
  if (!tender) return null;

  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="text-indigo-600 text-sm hover:underline mb-5 block">← Back to Requirements</button>

      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{tender.title}</h2>
          <p className="text-gray-500 text-sm">{tender.category} · {tender.department} · Created by {tender.creator_name}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${tender.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
            {tender.status}
          </span>
          {user.role === 'admin' && (
            <button onClick={handleClose} disabled={closing}
              className="px-3 py-1.5 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-60">
              {closing ? '…' : tender.status === 'open' ? 'Close Tender' : 'Reopen Tender'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Tender Details</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {tender.deadline && (
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Deadline</p>
                  <p className="text-sm font-medium text-gray-800">{new Date(tender.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              )}
              {tender.budget && (
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Budget</p>
                  <p className="text-sm font-medium text-gray-800">AED {Number(tender.budget).toLocaleString()}</p>
                </div>
              )}
            </div>
            {tender.description && (
              <div className="mb-4">
                <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Description</p>
                <p className="text-sm text-gray-700 leading-relaxed">{tender.description}</p>
              </div>
            )}
            {tender.specifications && (
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Specifications</p>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{tender.specifications}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Quotes Received ({quotes.length})</h3>
              {quotes.length >= 2 && (
                <Link to={`/requirements/${id}/comparison`}
                  className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
                  View Comparison
                </Link>
              )}
            </div>

            {quotes.length === 0 ? (
              <p className="text-sm text-gray-400">No quotes received yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left">
                      <th className="pb-2 text-xs font-semibold text-gray-400 uppercase">Vendor</th>
                      <th className="pb-2 text-xs font-semibold text-gray-400 uppercase">Total (AED)</th>
                      <th className="pb-2 text-xs font-semibold text-gray-400 uppercase">Unit Price</th>
                      <th className="pb-2 text-xs font-semibold text-gray-400 uppercase">Delivery</th>
                      <th className="pb-2 text-xs font-semibold text-gray-400 uppercase">Validity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {quotes.map((q, i) => (
                      <tr key={q.id} className={i === 0 ? 'bg-green-50' : ''}>
                        <td className="py-2.5 font-medium text-gray-900">
                          {q.vendor_name}
                          {i === 0 && <span className="ml-2 text-xs bg-green-600 text-white px-1.5 py-0.5 rounded-full">Lowest</span>}
                        </td>
                        <td className="py-2.5 font-bold text-gray-900">{Number(q.total_amount).toLocaleString()} {q.currency}</td>
                        <td className="py-2.5 text-gray-600">{Number(q.unit_price).toLocaleString()} {q.currency}</td>
                        <td className="py-2.5 text-gray-600">{q.delivery_days} days</td>
                        <td className="py-2.5 text-gray-600">{q.validity_days} days</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 h-fit">
          <h3 className="font-semibold text-gray-900 mb-3">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Total quotes</span><span className="font-semibold">{quotes.length}</span></div>
            {quotes.length > 0 && <>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Lowest bid</span><span className="font-semibold text-green-600">{Number(Math.min(...quotes.map(q => q.total_amount))).toLocaleString()}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Highest bid</span><span className="font-semibold">{Number(Math.max(...quotes.map(q => q.total_amount))).toLocaleString()}</span></div>
            </>}
          </div>
          {quotes.length >= 2 && (
            <Link to={`/requirements/${id}/comparison`}
              className="mt-4 block text-center px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700">
              Compare All Quotes
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
