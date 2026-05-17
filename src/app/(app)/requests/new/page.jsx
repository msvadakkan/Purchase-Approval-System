'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, AlertCircle, Building2, Info } from 'lucide-react'
import api from '@/lib/api'
import { useCompany } from '@/context/CompanyContext'

const CATEGORIES = ['IT Equipment', 'Office Supplies', 'Travel', 'Software', 'Training', 'Marketing', 'Furniture', 'Services', 'Other']

export default function NewRequestPage() {
  const router = useRouter()
  const { companies, activeCompany } = useCompany()

  const [form, setForm] = useState({
    title: '', description: '', amount: '', category: '',
    company_id: activeCompany?.id ?? '',
  })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.category) { setError('Please select a category'); return }
    setError(''); setLoading(true)
    try {
      const { data } = await api.post('/requests', { ...form, amount: parseFloat(form.amount) })
      router.push(`/requests/${data.id}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 sm:p-6">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-indigo-600 text-sm hover:underline mb-5">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">New Purchase Request</h2>
      <p className="text-gray-500 text-sm mb-6">Submit a purchase request for approval</p>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          {companies.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-indigo-500" /> Company</span>
              </label>
              <select value={form.company_id} onChange={set('company_id')}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">— No specific company —</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Request Title <span className="text-red-500">*</span></label>
            <input value={form.title} onChange={set('title')}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. MacBook Pro for design team" required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category <span className="text-red-500">*</span></label>
              <select value={form.category} onChange={set('category')}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
                <option value="">Select…</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Amount (AED) <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">AED</span>
                <input type="number" value={form.amount} onChange={set('amount')}
                  className="w-full border border-gray-300 rounded-xl pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0.00" min="0.01" step="0.01" required />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
            <textarea value={form.description} onChange={set('description')} rows={4}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Describe what you need and why this purchase is necessary…" />
          </div>

          {form.amount && !isNaN(parseFloat(form.amount)) && (
            <div className="flex items-start gap-2 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3">
              <Info className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-indigo-700">
                A request for <strong>AED {Number(parseFloat(form.amount)).toLocaleString()}</strong> will be automatically routed to the appropriate approver based on configured thresholds.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button type="button" onClick={() => router.back()}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-colors">
              {loading ? 'Submitting…' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
