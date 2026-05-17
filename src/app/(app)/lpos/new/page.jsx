'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, AlertCircle, FileOutput } from 'lucide-react'
import api from '@/lib/api'
import { useCompany } from '@/context/CompanyContext'

const EMPTY_ITEM = { description: '', quantity: 1, unit: 'pcs', unit_price: '' }
const CURRENCIES  = ['AED', 'USD', 'EUR', 'GBP', 'SAR']
const UNITS       = ['pcs', 'box', 'kg', 'set', 'unit', 'meter', 'liter', 'hour', 'month']

export default function NewLPOPage() {
  const router = useRouter()
  const params = useSearchParams()
  const { companies, activeCompany } = useCompany()

  const [vendors, setVendors]   = useState([])
  const [items, setItems]       = useState([{ ...EMPTY_ITEM }])
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const [form, setForm] = useState({
    company_id:    activeCompany?.id ?? '',
    vendor_id:     '',
    issue_date:    new Date().toISOString().slice(0, 10),
    delivery_date: '',
    payment_terms: 'Net 30 days',
    currency:      'AED',
    vat_rate:      5,
    notes:         '',
    request_id:    params.get('request_id') ?? '',
  })

  useEffect(() => {
    api.get('/vendors').then(({ data }) => setVendors(data.filter(v => v.status === 'approved')))
  }, [])

  useEffect(() => {
    if (activeCompany && !form.company_id)
      setForm(f => ({ ...f, company_id: activeCompany.id }))
  }, [activeCompany])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const setItem = (i, k, v) => setItems(items.map((it, idx) => idx === i ? { ...it, [k]: v } : it))
  const addItem    = () => setItems(it => [...it, { ...EMPTY_ITEM }])
  const removeItem = i => setItems(it => it.filter((_, idx) => idx !== i))

  const subtotal    = items.reduce((s, it) => s + (parseFloat(it.quantity) || 0) * (parseFloat(it.unit_price) || 0), 0)
  const vatAmount   = subtotal * (parseFloat(form.vat_rate) / 100)
  const totalAmount = subtotal + vatAmount
  const fmt = n => Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.company_id) { setError('Please select a company'); return }
    if (!form.vendor_id)  { setError('Please select a vendor'); return }
    if (items.some(it => !it.description)) { setError('All items need a description'); return }
    setError(''); setLoading(true)
    try {
      const payload = {
        ...form, vat_rate: parseFloat(form.vat_rate),
        items: items.map(it => ({
          description: it.description,
          quantity:    parseFloat(it.quantity) || 1,
          unit:        it.unit,
          unit_price:  parseFloat(it.unit_price) || 0,
        })),
      }
      const { data } = await api.post('/lpos', payload)
      router.push(`/lpos/${data.id}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create LPO')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 sm:p-6">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-indigo-600 text-sm hover:underline mb-5">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">New Local Purchase Order</h2>
      <p className="text-gray-500 text-sm mb-6">Generate an LPO for a vendor with itemized costs</p>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-5">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 mb-4">Parties</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Issuing Company <span className="text-red-500">*</span></label>
              <select value={form.company_id} onChange={set('company_id')}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select company…</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Vendor / Supplier <span className="text-red-500">*</span></label>
              <select value={form.vendor_id} onChange={set('vendor_id')}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select vendor…</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.company_name}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 mb-4">LPO Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Issue Date</label>
              <input type="date" value={form.issue_date} onChange={set('issue_date')}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Delivery Date</label>
              <input type="date" value={form.delivery_date} onChange={set('delivery_date')}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Payment Terms</label>
              <select value={form.payment_terms} onChange={set('payment_terms')}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {['Net 30 days','Net 60 days','Net 90 days','Advance Payment','50% Advance','Cash on Delivery'].map(t =>
                  <option key={t} value={t}>{t}</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Currency</label>
              <select value={form.currency} onChange={set('currency')}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500">Line Items</h3>
            <button type="button" onClick={addItem}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100">
              <Plus className="w-3.5 h-3.5" /> Add Item
            </button>
          </div>

          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left">
                  {[['Description','w-[40%]'],['Qty','w-[12%]'],['Unit','w-[12%]'],['Unit Price','w-[18%]'],['Total','w-[14%] text-right'],['','w-8']].map(([h,cls]) => (
                    <th key={h} className={`pb-2 text-xs font-bold text-gray-500 uppercase tracking-wider ${cls}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((it, i) => (
                  <tr key={i}>
                    <td className="py-2 pr-2">
                      <input value={it.description} onChange={e => setItem(i, 'description', e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Item description…" />
                    </td>
                    <td className="py-2 pr-2">
                      <input type="number" value={it.quantity} min="0.01" step="0.01"
                        onChange={e => setItem(i, 'quantity', e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </td>
                    <td className="py-2 pr-2">
                      <select value={it.unit} onChange={e => setItem(i, 'unit', e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </td>
                    <td className="py-2 pr-2">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">{form.currency}</span>
                        <input type="number" value={it.unit_price} min="0" step="0.01"
                          onChange={e => setItem(i, 'unit_price', e.target.value)}
                          className="w-full border border-gray-200 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="0.00" />
                      </div>
                    </td>
                    <td className="py-2 pr-2 text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        {fmt((parseFloat(it.quantity) || 0) * (parseFloat(it.unit_price) || 0))}
                      </span>
                    </td>
                    <td className="py-2">
                      {items.length > 1 && (
                        <button type="button" onClick={() => removeItem(i)} className="p-1 text-red-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sm:hidden space-y-3">
            {items.map((it, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500">Item {i + 1}</span>
                  {items.length > 1 && <button type="button" onClick={() => removeItem(i)} className="text-red-400"><Trash2 className="w-4 h-4" /></button>}
                </div>
                <input value={it.description} onChange={e => setItem(i, 'description', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Description…" />
                <div className="grid grid-cols-3 gap-2">
                  <input type="number" value={it.quantity} min="0.01" step="0.01"
                    onChange={e => setItem(i, 'quantity', e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Qty" />
                  <select value={it.unit} onChange={e => setItem(i, 'unit', e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <input type="number" value={it.unit_price} min="0" step="0.01"
                    onChange={e => setItem(i, 'unit_price', e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Price" />
                </div>
                <p className="text-xs text-right font-semibold text-indigo-600">
                  {form.currency} {fmt((parseFloat(it.quantity) || 0) * (parseFloat(it.unit_price) || 0))}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 space-y-2 ml-auto max-w-xs">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold">{form.currency} {fmt(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600 gap-4">
              <div className="flex items-center gap-2">
                <span>VAT</span>
                <div className="flex items-center gap-1">
                  <input type="number" value={form.vat_rate} min="0" max="100" step="0.5" onChange={set('vat_rate')}
                    className="w-14 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  <span className="text-xs">%</span>
                </div>
              </div>
              <span className="font-semibold">{form.currency} {fmt(vatAmount)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>{form.currency} {fmt(totalAmount)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notes / Terms & Conditions</label>
          <textarea value={form.notes} onChange={set('notes')} rows={3}
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            placeholder="Delivery instructions, special terms, or any additional notes…" />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button type="button" onClick={() => router.back()}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2">
            <FileOutput className="w-4 h-4" />
            {loading ? 'Generating…' : 'Generate LPO'}
          </button>
        </div>
      </form>
    </div>
  )
}
