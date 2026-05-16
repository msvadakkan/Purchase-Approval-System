import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import { useVendorAuth } from '../../context/VendorAuthContext';

const CURRENCIES = ['AED', 'USD', 'EUR', 'GBP'];

export default function VendorTenderDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { vendor } = useVendorAuth();

  const [tender, setTender]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState('');

  const [form, setForm] = useState({
    unit_price: '', total_amount: '', currency: 'AED',
    delivery_days: '', validity_days: '30',
    payment_terms: '', warranty: '', notes: '',
  });

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    api.get(`/tenders/${id}`).then(({ data }) => {
      setTender(data);
      if (data.my_quote) {
        const q = data.my_quote;
        setForm({
          unit_price:    q.unit_price ?? '',
          total_amount:  q.total_amount ?? '',
          currency:      q.currency ?? 'AED',
          delivery_days: q.delivery_days ?? '',
          validity_days: q.validity_days ?? 30,
          payment_terms: q.payment_terms ?? '',
          warranty:      q.warranty ?? '',
          notes:         q.notes ?? '',
        });
        setSubmitted(true);
      }
    }).catch(() => navigate('/vendor/tenders')).finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.unit_price || !form.total_amount || !form.delivery_days) {
      setError('Unit price, total amount, and delivery days are required');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await api.post(`/tenders/${id}/quote`, {
        ...form,
        unit_price:    parseFloat(form.unit_price),
        total_amount:  parseFloat(form.total_amount),
        delivery_days: parseInt(form.delivery_days),
        validity_days: parseInt(form.validity_days),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit quote');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-400">Loading…</div>;
  if (!tender) return null;

  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="text-teal-600 text-sm hover:underline mb-5 block">← Back to Tenders</button>

      <h2 className="text-2xl font-bold text-gray-900 mb-1">{tender.title}</h2>
      <p className="text-gray-500 text-sm mb-6">{tender.category} · {tender.department}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tender Info */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Tender Details</h3>
            <div className="space-y-3 text-sm">
              {tender.deadline && (
                <div><p className="text-xs text-gray-400 uppercase font-semibold">Deadline</p>
                  <p className="text-gray-800">{new Date(tender.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              )}
              {tender.budget && (
                <div><p className="text-xs text-gray-400 uppercase font-semibold">Budget</p>
                  <p className="text-gray-800 font-semibold text-teal-700">AED {Number(tender.budget).toLocaleString()}</p>
                </div>
              )}
              {tender.description && (
                <div><p className="text-xs text-gray-400 uppercase font-semibold">Description</p>
                  <p className="text-gray-700 leading-relaxed">{tender.description}</p>
                </div>
              )}
              {tender.specifications && (
                <div><p className="text-xs text-gray-400 uppercase font-semibold">Specifications</p>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{tender.specifications}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quote Form */}
        <div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                {submitted ? 'Your Submitted Quote' : 'Submit Your Quote'}
              </h3>
              {submitted && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                  {tender.my_quote ? 'Submitted ✓' : 'Updating…'}
                </span>
              )}
            </div>

            {tender.status !== 'open' ? (
              <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600 text-center">
                This tender is closed and no longer accepting quotes.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">{error}</div>}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Unit Price <span className="text-red-500">*</span></label>
                    <input type="number" value={form.unit_price} onChange={set('unit_price')} min="0" step="0.01"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="0.00" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Total Amount <span className="text-red-500">*</span></label>
                    <input type="number" value={form.total_amount} onChange={set('total_amount')} min="0" step="0.01"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="0.00" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Currency</label>
                    <select value={form.currency} onChange={set('currency')}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                      {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Delivery (days) <span className="text-red-500">*</span></label>
                    <input type="number" value={form.delivery_days} onChange={set('delivery_days')} min="1"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="14" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Validity (days)</label>
                    <input type="number" value={form.validity_days} onChange={set('validity_days')} min="1"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="30" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Payment Terms</label>
                    <input value={form.payment_terms} onChange={set('payment_terms')}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="30 days net" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Warranty / Guarantee</label>
                  <input value={form.warranty} onChange={set('warranty')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="12 months manufacturer warranty" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
                  <textarea value={form.notes} onChange={set('notes')} rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                    placeholder="Additional information or conditions…" />
                </div>

                <button type="submit" disabled={submitting}
                  className="w-full py-2.5 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 disabled:opacity-60 transition-colors">
                  {submitting ? 'Submitting…' : submitted ? 'Update Quote' : 'Submit Quote'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
