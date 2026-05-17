'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ClipboardList, Plus, Inbox, Calendar, MessageSquare } from 'lucide-react'
import api from '@/lib/api'

const STATUS_STYLES = {
  open:   'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  closed: 'bg-gray-100 text-gray-500 ring-1 ring-gray-200',
}

export default function RequirementsPage() {
  const [tenders, setTenders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all')

  useEffect(() => {
    api.get('/tenders').then(({ data }) => setTenders(data)).finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? tenders : tenders.filter(t => t.status === filter)

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Requirements / Tenders</h2>
          <p className="text-gray-500 text-sm mt-0.5">Procurement requirements open for vendor bidding</p>
        </div>
        <Link href="/requirements/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> New Requirement
        </Link>
      </div>

      <div className="flex gap-2 mb-5">
        {['all', 'open', 'closed'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold capitalize transition-colors ${
              filter === f ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-8 h-8 text-gray-400" />
          </div>
          <p className="font-semibold text-gray-500">No requirements found</p>
          <p className="text-sm mt-1">
            <Link href="/requirements/new" className="text-indigo-600 font-medium hover:underline">Create one</Link>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(t => (
            <Link key={t.id} href={`/requirements/${t.id}`}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-indigo-200 hover:shadow-md transition-all block">
              <div className="flex items-start justify-between mb-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[t.status] ?? 'bg-gray-100 text-gray-500'}`}>
                  {t.status}
                </span>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{t.quote_count ?? 0} quote{t.quote_count !== 1 ? 's' : ''}</span>
                </div>
              </div>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ClipboardList className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm group-hover:text-indigo-600 leading-snug">{t.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{t.description || 'No description'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-50">
                <span className="font-medium">{t.category || 'General'} · {t.department || '—'}</span>
                {t.deadline && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(t.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>
              {t.budget && (
                <div className="mt-2 text-xs font-bold text-indigo-600">Budget: AED {Number(t.budget).toLocaleString()}</div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
