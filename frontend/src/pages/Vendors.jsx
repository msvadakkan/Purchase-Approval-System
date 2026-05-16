import { useState, useEffect } from 'react';
import api from '../api';

const STATUS_COLORS = {
  pending:  'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100  text-green-700',
  rejected: 'bg-red-100    text-red-700',
};

export default function Vendors() {
  const [vendors, setVendors]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter]     = useState('all');

  const load = () => {
    api.get('/vendors').then(({ data }) => setVendors(data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleApprove = async (id) => {
    await api.post(`/vendors/${id}/approve`);
    load();
    if (selected?.id === id) setSelected(prev => ({ ...prev, status: 'approved' }));
  };

  const handleReject = async (id) => {
    await api.put(`/vendors/${id}`, { status: 'rejected' });
    load();
    if (selected?.id === id) setSelected(prev => ({ ...prev, status: 'rejected' }));
  };

  const filtered = filter === 'all' ? vendors : vendors.filter(v => v.status === filter);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Vendor Registry</h2>
        <p className="text-gray-500 text-sm">Manage registered vendors and their approval status</p>
      </div>

      <div className="flex gap-2 mb-4">
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === f ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            {f}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No vendors found</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                  {['Company', 'VAT No.', 'Contact', 'Sales Person', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(v => (
                  <tr key={v.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelected(v)}>
                    <td className="px-5 py-3 font-medium text-gray-900 text-sm">{v.company_name}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{v.vat_number}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{v.contact_number}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{v.sales_person}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[v.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                        {v.status !== 'approved' && (
                          <button onClick={() => handleApprove(v.id)}
                            className="px-2 py-1 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700">
                            Approve
                          </button>
                        )}
                        {v.status !== 'rejected' && (
                          <button onClick={() => handleReject(v.id)}
                            className="px-2 py-1 border border-red-200 text-red-600 text-xs font-medium rounded-lg hover:bg-red-50">
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {selected && (
          <div className="w-80 flex-shrink-0 bg-white rounded-xl border border-gray-200 p-5 h-fit">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Vendor Detail</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="space-y-3 text-sm">
              <Field label="Company">{selected.company_name}</Field>
              <Field label="VAT No.">{selected.vat_number}</Field>
              <Field label="Contact">{selected.contact_number}</Field>
              <Field label="Sales Person">{selected.sales_person}</Field>
              <Field label="Email">{selected.email}</Field>
              <Field label="Address">{selected.address}</Field>

              {selected.bank_details && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">UAE Bank Details</p>
                  <Field label="Bank">{selected.bank_details.bank_name}</Field>
                  <Field label="Account Name">{selected.bank_details.account_name}</Field>
                  <Field label="Account No.">{selected.bank_details.account_number}</Field>
                  <Field label="IBAN">{selected.bank_details.iban}</Field>
                  <Field label="SWIFT">{selected.bank_details.swift_code}</Field>
                  <Field label="Branch">{selected.bank_details.branch}</Field>
                </div>
              )}

              {selected.attachments?.length > 0 && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Attachments</p>
                  {selected.attachments.map((a, i) => (
                    <a key={i} href={`/api/uploads/vendors/${a.filename}`} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 py-1.5 text-indigo-600 hover:underline text-xs">
                      📎 {a.original} <span className="text-gray-400">({a.type.replace('_', ' ')})</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <p className="text-xs text-gray-400 font-semibold">{label}</p>
      <p className="text-gray-800">{children || '—'}</p>
    </div>
  );
}
