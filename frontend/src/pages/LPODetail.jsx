import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, CheckCircle2, Send, Building2, MapPin, Phone, Mail, Globe } from 'lucide-react';
import api from '../api';

const fmt = (n, currency = 'AED') =>
  `${currency} ${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const STATUS_COLORS = {
  draft:        { bg: 'bg-gray-100',   text: 'text-gray-700'  },
  sent:         { bg: 'bg-blue-100',   text: 'text-blue-700'  },
  acknowledged: { bg: 'bg-green-100',  text: 'text-green-700' },
};

export default function LPODetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lpo, setLpo]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    api.get(`/lpos/${id}`)
      .then(({ data }) => setLpo(data))
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (status) => {
    setUpdating(true);
    try {
      await api.put(`/lpos/${id}`, { status });
      setLpo(l => ({ ...l, status }));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading…</div>;
  if (!lpo)   return <div className="p-6 text-red-500">LPO not found.</div>;

  const co = lpo.company_snapshot ?? {};
  const vd = lpo.vendor_snapshot  ?? {};
  const currency = lpo.currency ?? 'AED';

  return (
    <>
      {/* Print-only styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
          .lpo-page { box-shadow: none !important; border: none !important; padding: 0 !important; }
        }
        @page { size: A4; margin: 15mm; }
      `}</style>

      {/* Toolbar — hidden on print */}
      <div className="no-print p-4 sm:p-6 pb-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-indigo-600 text-sm hover:underline self-start">
            <ArrowLeft className="w-4 h-4" /> Back to LPOs
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status badge */}
            {(() => { const s = STATUS_COLORS[lpo.status] ?? STATUS_COLORS.draft; return (
              <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${s.bg} ${s.text}`}>{lpo.status}</span>
            ); })()}

            {lpo.status === 'draft' && (
              <button onClick={() => updateStatus('sent')} disabled={updating}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors">
                <Send className="w-3.5 h-3.5" /> Mark Sent
              </button>
            )}
            {lpo.status === 'sent' && (
              <button onClick={() => updateStatus('acknowledged')} disabled={updating}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors">
                <CheckCircle2 className="w-3.5 h-3.5" /> Mark Acknowledged
              </button>
            )}
            <button onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
              <Printer className="w-3.5 h-3.5" /> Print / Save PDF
            </button>
          </div>
        </div>
      </div>

      {/* LPO Document */}
      <div className="p-4 sm:p-6 pt-0">
        <div className="lpo-page max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 text-white px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  {co.logo_filename
                    ? <img src={`/api/uploads/companies/${co.logo_filename}`} alt="logo" className="w-full h-full object-cover rounded-2xl" />
                    : <Building2 className="w-7 h-7 text-white" />
                  }
                </div>
                <div>
                  <h1 className="text-xl font-bold">{co.name ?? 'Company'}</h1>
                  {co.vat_number && <p className="text-indigo-200 text-xs mt-0.5">TRN: {co.vat_number}</p>}
                  {co.trade_license_no && <p className="text-indigo-200 text-xs">Lic: {co.trade_license_no}</p>}
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black tracking-tight">LOCAL PURCHASE ORDER</p>
                <p className="text-indigo-200 text-sm mt-1">LPO No: <strong className="text-white">{lpo.lpo_number}</strong></p>
                <p className="text-indigo-200 text-xs">
                  Issue Date: {lpo.issue_date ? new Date(lpo.issue_date).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : '—'}
                </p>
                {lpo.delivery_date && (
                  <p className="text-indigo-200 text-xs">
                    Delivery: {new Date(lpo.delivery_date).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Company + Vendor row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            {/* Bill From */}
            <div className="px-8 py-5">
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3">Bill From</p>
              <p className="font-bold text-gray-900">{co.name}</p>
              {co.address && (
                <div className="flex items-start gap-1.5 mt-1.5 text-sm text-gray-500">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-gray-400" />
                  <span>{co.address}{co.city ? `, ${co.city}` : ''}{co.country ? `, ${co.country}` : ''}</span>
                </div>
              )}
              {co.phone && (
                <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{co.phone}</span>
                </div>
              )}
              {co.email && (
                <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span>{co.email}</span>
                </div>
              )}
              {co.website && (
                <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                  <Globe className="w-3.5 h-3.5 text-gray-400" />
                  <span>{co.website}</span>
                </div>
              )}
            </div>

            {/* Vendor / Bill To */}
            <div className="px-8 py-5 bg-gray-50/50">
              <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-3">Vendor / Bill To</p>
              <p className="font-bold text-gray-900">{vd.company_name}</p>
              {vd.address && (
                <div className="flex items-start gap-1.5 mt-1.5 text-sm text-gray-500">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-gray-400" />
                  <span>{vd.address}</span>
                </div>
              )}
              {vd.contact_number && (
                <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{vd.contact_number}</span>
                </div>
              )}
              {vd.email && (
                <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span>{vd.email}</span>
                </div>
              )}
              {vd.vat_number && (
                <p className="text-xs text-gray-400 mt-1">TRN: {vd.vat_number}</p>
              )}
              {vd.sales_person && (
                <p className="text-xs text-gray-400 mt-0.5">Attn: {vd.sales_person}</p>
              )}
            </div>
          </div>

          {/* LPO Meta strip */}
          <div className="border-t border-b border-gray-100 px-8 py-3 bg-indigo-50 flex flex-wrap gap-6 text-xs text-gray-600">
            <div><span className="font-bold text-gray-500 uppercase tracking-wide">Payment Terms</span><br />{lpo.payment_terms ?? '—'}</div>
            {lpo.delivery_date && <div><span className="font-bold text-gray-500 uppercase tracking-wide">Required Delivery</span><br />{new Date(lpo.delivery_date).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}</div>}
            <div><span className="font-bold text-gray-500 uppercase tracking-wide">Currency</span><br />{currency}</div>
            <div><span className="font-bold text-gray-500 uppercase tracking-wide">Prepared By</span><br />{lpo.created_by_name ?? '—'}</div>
          </div>

          {/* Items Table */}
          <div className="px-8 py-5">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-indigo-100">
                    <th className="py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-8">#</th>
                    <th className="py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="py-2 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-16">Qty</th>
                    <th className="py-2 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-16">Unit</th>
                    <th className="py-2 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-28">Unit Price</th>
                    <th className="py-2 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-28">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(lpo.items ?? []).map((item, i) => (
                    <tr key={i} className={`border-b border-gray-50 ${i % 2 === 1 ? 'bg-gray-50/40' : ''}`}>
                      <td className="py-3 text-gray-400 text-xs">{i + 1}</td>
                      <td className="py-3 text-gray-900 font-medium">{item.description}</td>
                      <td className="py-3 text-right text-gray-700">{item.quantity}</td>
                      <td className="py-3 text-right text-gray-500 text-xs">{item.unit}</td>
                      <td className="py-3 text-right text-gray-700">
                        {Number(item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 text-right font-semibold text-gray-900">
                        {Number(item.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-4 flex justify-end">
              <div className="w-72 space-y-1.5">
                <div className="flex justify-between text-sm text-gray-600 py-1">
                  <span>Subtotal</span>
                  <span className="font-semibold">{fmt(lpo.subtotal, currency)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 py-1">
                  <span>VAT ({lpo.vat_rate ?? 5}%)</span>
                  <span className="font-semibold">{fmt(lpo.vat_amount, currency)}</span>
                </div>
                <div className="flex justify-between items-center bg-indigo-600 text-white px-4 py-3 rounded-xl mt-2">
                  <span className="font-bold text-sm">TOTAL AMOUNT</span>
                  <span className="font-black text-base">{fmt(lpo.total_amount, currency)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bank details of vendor (if available) */}
          {vd.bank_details?.bank_name && (
            <div className="mx-8 mb-5 p-4 bg-teal-50 border border-teal-100 rounded-xl">
              <p className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-2">Vendor Bank Details</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-gray-600">
                {vd.bank_details.bank_name     && <div><span className="text-gray-400">Bank</span><br /><strong>{vd.bank_details.bank_name}</strong></div>}
                {vd.bank_details.account_name  && <div><span className="text-gray-400">Account Name</span><br /><strong>{vd.bank_details.account_name}</strong></div>}
                {vd.bank_details.account_number&& <div><span className="text-gray-400">Account No.</span><br /><strong>{vd.bank_details.account_number}</strong></div>}
                {vd.bank_details.iban          && <div><span className="text-gray-400">IBAN</span><br /><strong>{vd.bank_details.iban}</strong></div>}
                {vd.bank_details.swift_code    && <div><span className="text-gray-400">SWIFT / BIC</span><br /><strong>{vd.bank_details.swift_code}</strong></div>}
                {vd.bank_details.branch        && <div><span className="text-gray-400">Branch</span><br /><strong>{vd.bank_details.branch}</strong></div>}
              </div>
            </div>
          )}

          {/* Notes */}
          {lpo.notes && (
            <div className="mx-8 mb-5 p-4 bg-yellow-50 border border-yellow-100 rounded-xl">
              <p className="text-xs font-bold text-yellow-700 uppercase tracking-wider mb-1">Notes / Terms</p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{lpo.notes}</p>
            </div>
          )}

          {/* Signature */}
          <div className="border-t border-gray-100 px-8 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <div className="border-b-2 border-gray-300 h-12 mb-2" />
                <p className="text-xs font-bold text-gray-500">Authorized Signature</p>
                <p className="text-xs text-gray-400">{co.name}</p>
              </div>
              <div>
                <div className="border-b-2 border-gray-300 h-12 mb-2" />
                <p className="text-xs font-bold text-gray-500">Received & Acknowledged</p>
                <p className="text-xs text-gray-400">{vd.company_name}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-100 px-8 py-3 text-center">
            <p className="text-xs text-gray-400">
              This is a computer-generated document. · {co.name} · {co.email}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
