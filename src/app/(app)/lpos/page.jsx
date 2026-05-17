'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileOutput, Plus, Inbox, Eye, Calendar, Building2 } from 'lucide-react'
import api from '@/lib/api'

const STATUS_STYLES = {
  draft:        'bg-gray-100   text-gray-600',
  sent:         'bg-blue-100   text-blue-700',
  acknowledged: 'bg-green-100  text-green-700',
}

export default function LPOsPage() {
  const [lpos, setLpos]       = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all')

  useEffect(() => {
    api.get('/lpos').then(({ data }) => setLpos(data)).finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? lpos : lpos.filter(l => l.status === filter)

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Local Purchase Orders</h2>
          <p className="text-gray-500 text-sm mt-0.5">Generate and manage LPOs for your vendors</p>
        </div>
        <Link href="/lpos/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm self-start sm:self-auto">
          <Plus className="w-4 h-4" /> New LPO
        </Link>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {['all', 'draft', 'sent', 'acknowledged'].map(f => (
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
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-8 h-8 text-gray-400" />
          </div>
          <p className="font-semibold text-gray-500">No LPOs found</p>
          <p className="text-sm text-gray-400 mt-1">
            <Link href="/lpos/new" className="text-indigo-600 font-medium hover:underline">Create your first LPO</Link>
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                  {['LPO Number', 'Company', 'Vendor', 'Amount', 'Date', 'Status', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(lpo => (
                  <tr key={lpo.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileOutput className="w-4 h-4 text-indigo-500" />
                        </div>
                        <span className="text-sm font-bold text-gray-900">{lpo.lpo_number}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-700">
                        <Building2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="truncate max-w-[140px]">{lpo.company_snapshot?.name ?? '—'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700 max-w-[140px]">
                      <span className="truncate block">{lpo.vendor_snapshot?.company_name ?? '—'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-bold text-gray-900">
                        {lpo.currency ?? 'AED'} {Number(lpo.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="w-3.5 h-3.5" />
                        {lpo.issue_date ? new Date(lpo.issue_date).toLocaleDateString() : '—'}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[lpo.status] ?? STATUS_STYLES.draft}`}>
                        {lpo.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/lpos/${lpo.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-indigo-200 text-indigo-600 text-xs font-semibold rounded-lg hover:bg-indigo-50">
                        <Eye className="w-3.5 h-3.5" /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
