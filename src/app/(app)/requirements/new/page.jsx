'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

const CATEGORIES = ['IT Equipment', 'Office Supplies', 'Furniture', 'Services', 'Construction', 'Catering', 'Marketing', 'Software', 'Other']

export default function NewRequirementPage() {
  const router = useRouter()
  const [form, setForm]   = useState({ title: '', description: '', specifications: '', category: '', department: '', deadline: '', budget: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title) { setError('Title is required'); return }
    setError(''); setLoading(true)
    try {
      const payload = { ...form, budget: form.budget ? parseFloat(form.budget) : null }
      const { data } = await api.post('/tenders', payload)
      router.push(`/requirements/${data.id}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create requirement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <button onClick={() => router.back()} className="text-indigo-600 text-sm hover:underline mb-5 block">← Back</button>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">New Requirement / Tender</h2>
      <p className="text-gray-500 text-sm mb-6">Create a procurement requirement that vendors can bid on</p>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
            <input value={form.title} onChange={set('title')}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Office Furniture Supply for HQ" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={form.category} onChange={set('category')}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select…</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input value={form.department} onChange={set('department')}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Operations" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quote Deadline</label>
              <input type="date" value={form.deadline} onChange={set('deadline')}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget (AED)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">AED</span>
                <input type="number" value={form.budget} onChange={set('budget')} min="0"
                  className="w-full border border-gray-300 rounded-lg pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Optional" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={set('description')} rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Overview of what is needed and why…" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specifications / Requirements</label>
            <textarea value={form.specifications} onChange={set('specifications')} rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="List item specifications, quantities, quality standards, delivery requirements…" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => router.back()}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-colors">
              {loading ? 'Creating…' : 'Create Requirement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
