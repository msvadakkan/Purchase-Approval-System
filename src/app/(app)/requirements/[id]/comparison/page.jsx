'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'

const FIELDS = [
  { key: 'total_amount',  label: 'Total Amount',   format: v => `${Number(v).toLocaleString()}` },
  { key: 'unit_price',    label: 'Unit Price',      format: v => `${Number(v).toLocaleString()}` },
  { key: 'currency',      label: 'Currency',        format: v => v },
  { key: 'delivery_days', label: 'Delivery (days)', format: v => v },
  { key: 'validity_days', label: 'Validity (days)', format: v => v },
  { key: 'payment_terms', label: 'Payment Terms',   format: v => v || '—' },
  { key: 'warranty',      label: 'Warranty',        format: v => v || '—' },
  { key: 'notes',         label: 'Notes',           format: v => v || '—' },
]

export default function QuoteComparisonPage() {
  const { id }  = useParams()
  const router  = useRouter()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/tenders/${id}/comparison`)
      .then(({ data: d }) => setData(d))
      .catch(() => router.push(`/requirements/${id}`))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-6 text-center text-gray-400">Loading…</div>
  if (!data) return null

  const { tender, quotes } = data
  const lowestIdx = quotes.findIndex(q => q.is_lowest)

  return (
    <div className="p-6">
      <div className="mb-6">
        <button onClick={() => router.back()} className="text-indigo-600 text-sm hover:underline mb-4 block">
          ← Back to {tender.title}
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Quote Comparison</h2>
        <p className="text-gray-500 text-sm">{tender.title} · {quotes.length} quotes received</p>
      </div>

      {quotes.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No quotes to compare yet.</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase w-40">Criteria</th>
                {quotes.map((q, i) => (
                  <th key={q.id} className={`px-5 py-4 text-center text-sm font-bold ${i === lowestIdx ? 'bg-green-50 text-green-800' : 'text-gray-800'}`}>
                    {q.vendor_name}
                    {i === lowestIdx && (
                      <span className="block text-xs font-normal bg-green-600 text-white px-2 py-0.5 rounded-full mt-1 mx-auto w-fit">
                        Lowest Price ★
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FIELDS.map(({ key, label, format }) => (
                <tr key={key} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{label}</td>
                  {quotes.map((q, i) => {
                    const isLowest  = key === 'total_amount' && q.is_lowest
                    const isFastest = key === 'delivery_days' && q.delivery_days === Math.min(...quotes.map(x => x.delivery_days))
                    return (
                      <td key={q.id}
                        className={`px-5 py-3 text-sm text-center font-medium ${
                          isLowest ? 'text-green-700 bg-green-50 font-bold' :
                          isFastest ? 'text-blue-700' : 'text-gray-700'
                        } ${i === lowestIdx ? 'bg-green-50/40' : ''}`}>
                        {format(q[key])}
                        {isLowest && <span className="text-xs ml-1">✓</span>}
                      </td>
                    )
                  })}
                </tr>
              ))}
              <tr className="bg-gray-50">
                <td className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Submitted</td>
                {quotes.map((q, i) => (
                  <td key={q.id} className={`px-5 py-3 text-xs text-center text-gray-400 ${i === lowestIdx ? 'bg-green-50/40' : ''}`}>
                    {new Date(q.submitted_at).toLocaleDateString()}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>

          <div className="p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Recommended: <strong className="text-gray-800">{quotes[lowestIdx]?.vendor_name}</strong> — lowest total at{' '}
              <strong className="text-green-600">{Number(quotes[lowestIdx]?.total_amount).toLocaleString()} {quotes[lowestIdx]?.currency}</strong>
            </p>
            <Link href={`/requirements/${id}`} className="text-indigo-600 text-sm hover:underline">Back to Tender</Link>
          </div>
        </div>
      )}
    </div>
  )
}
