'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Calendar, Tag, ArrowRight, Filter, X } from 'lucide-react'
import api from '@/lib/api'

const STATUS_COLORS = {
  open:   'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-500',
}

export default function VendorTendersPage() {
  const [tenders, setTenders]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [status, setStatus]     = useState('open')
  const [category, setCategory] = useState('')

  useEffect(() => {
    api.get('/tenders').then(({ data }) => setTenders(data)).finally(() => setLoading(false))
  }, [])

  const categories = [...new Set(tenders.map(t => t.category).filter(Boolean))]

  const filtered = tenders.filter(t => {
    const matchSearch   = !search   || t.title.toLowerCase().includes(search.toLowerCase()) || (t.description || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus   = !status   || t.status === status
    const matchCategory = !category || t.category === category
    return matchSearch && matchStatus && matchCategory
  })

  const clearFilters = () => { setSearch(''); setStatus('open'); setCategory('') }
  const hasFilters = search || status !== 'open' || category

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Open Tenders</h2>
        <p className="text-gray-500 text-sm mt-0.5">Browse procurement requirements and submit your quotes</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tenders…"
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
          {categories.length > 0 && (
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-2.5 flex items-center gap-1">
          <Filter className="w-3 h-3" /> {filtered.length} tender{filtered.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Tender List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
          Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-gray-400">No tenders match your filters</p>
          {hasFilters && (
            <button onClick={clearFilters} className="mt-3 text-teal-600 text-sm hover:underline">Clear filters</button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(t => (
            <Link key={t.id} href={`/vendor/tenders/${t.id}`}
              className="group block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-teal-100 transition-all p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[t.status] || 'bg-gray-100 text-gray-600'}`}>
                      {t.status === 'open' ? 'Open' : 'Closed'}
                    </span>
                    {t.category && (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 bg-teal-50 text-teal-700 rounded-full text-xs font-medium">
                        <Tag className="w-3 h-3" /> {t.category}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors truncate">{t.title}</h3>
                  {t.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{t.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                    {t.deadline && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Due {new Date(t.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                    {t.budget && (
                      <span className="font-medium text-gray-500">
                        Budget: AED {parseFloat(t.budget).toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-teal-50 group-hover:bg-teal-100 flex items-center justify-center transition-colors">
                  <ArrowRight className="w-5 h-5 text-teal-600" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
