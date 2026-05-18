'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ClipboardList, Plus, Inbox, Calendar, MessageSquare, Building2 } from 'lucide-react'
import api from '@/lib/api'

const STATUS_STYLES = {
  open:   'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  closed: 'bg-gray-100 text-gray-500 ring-1 ring-gray-200',
}

const DEPT_COLORS = [
  'bg-violet-100 text-violet-700', 'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',   'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',     'bg-teal-100 text-teal-700',
  'bg-yellow-100 text-yellow-700', 'bg-red-100 text-red-700',
]
const deptColor = (dept) => DEPT_COLORS[(dept?.charCodeAt(0) ?? 0) % DEPT_COLORS.length]

export default function RequirementsPage() {
  const [tenders, setTenders]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [deptFilter, setDeptFilter]     = useState('all')

  useEffect(() => {
    api.get('/tenders').then(({ data }) => setTenders(data)).finally(() => setLoading(false))
  }, [])

  const departments = ['all', ...Array.from(new Set(tenders.map(t => t.department).filter(Boolean))).sort()]

  const filtered = tenders.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false
    if (deptFilter !== 'all' && t.department !== deptFilter) return false
    return true
  })

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Requirements / Tenders</h2>
          <p className="text-gray-500 text-sm mt-0.5">Procurement requirements open for vendor bidding</p>
        </div>
        <Link href="/requirements/new"
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> New Requirement
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        {/* Status filter */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {['all', 'open', 'closed'].map(f => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold capitalize transition-colors ${
                statusFilter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {f}
            </button>
          ))}
        </div>

        {/* Department filter */}
        {departments.length > 1 && (
          <div className="flex gap-1 flex-wrap">
            {departments.map(d => (
              <button key={d} onClick={() => setDeptFilter(d)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold capitalize transition-colors ${
                  deptFilter === d
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}>
                {d !== 'all' && <Building2 className="w-3.5 h-3.5" />}
                {d === 'all' ? 'All Depts' : d}
              </button>
            ))}
          </div>
        )}
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
            <Link href="/requirements/new" className="text-violet-600 font-medium hover:underline">Create one</Link>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(t => (
            <Link key={t.id} href={`/requirements/${t.id}`}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-violet-200 hover:shadow-md transition-all block">
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
                <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ClipboardList className="w-4 h-4 text-violet-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm group-hover:text-violet-600 leading-snug">{t.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{t.description || 'No description'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  {t.department && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${deptColor(t.department)}`}>
                      {t.department}
                    </span>
                  )}
                  {t.category && (
                    <span className="text-[11px] text-gray-400">{t.category}</span>
                  )}
                </div>
                {t.deadline && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    {new Date(t.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>
              {t.budget && (
                <div className="mt-2 text-xs font-bold text-violet-600">Budget: AED {Number(t.budget).toLocaleString()}</div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
