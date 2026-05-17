'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Calendar, Tag, FileText, DollarSign,
  CheckCircle, Clock, ChevronDown, ChevronUp, Send,
  AlertCircle, Package, Building2
} from 'lucide-react'
import api from '@/lib/api'
import { useVendorAuth } from '@/context/VendorAuthContext'

const fmt = (n) => parseFloat(n || 0).toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function VendorTenderDetailPage() {
  const { id }     = useParams()
  const router     = useRouter()
  const { vendor } = useVendorAuth()

  const [tender, setTender]         = useState(null)
  const [myQuote, setMyQuote]       = useState(null)
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState(false)

  const [form, setForm] = useState({
    unit_price: '',
    delivery_days: '',
    validity_days: '30',
    notes: '',
  })

  useEffect(() => {
    Promise.all([
      api.get(`/tenders/${id}`),
      api.get(`/tenders/${id}/quotes`).catch(() => ({ data: [] })),
    ]).then(([{ data: t }, { data: quotes }]) => {
      setTender(t)
      const mine = quotes.find(q => q.vendor_id === vendor?.id)
      setMyQuote(mine || null)
    }).finally(() => setLoading(false))
  }, [id, vendor])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.unit_price || parseFloat(form.unit_price) <= 0) {
      setError('Please enter a valid unit price')
      return
    }
    setError(''); setSubmitting(true)
    try {
      await api.post(`/tenders/${id}/quote`, {
        unit_price:     parseFloat(form.unit_price),
        delivery_days:  form.delivery_days ? parseInt(form.delivery_days) : null,
        validity_days:  form.validity_days ? parseInt(form.validity_days) : 30,
        notes:          form.notes,
      })
      setSuccess(true)
      setShowForm(false)
      // Refresh quote
      const { data: quotes } = await api.get(`/tenders/${id}/quotes`).catch(() => ({ data: [] }))
      const mine = quotes.find(q => q.vendor_id === vendor?.id)
      setMyQuote(mine || null)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit quote')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="p-6 flex items-center justify-center min-h-64">
      <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!tender) return (
    <div className="p-6 text-center text-gray-500">Tender not found.</div>
  )

  const isClosed   = tender.status === 'closed'
  const canQuote   = !isClosed && !myQuote
  const isDeadline = tender.deadline && new Date(tender.deadline) < new Date()

  return (
    <div className="p-6 max-w-3xl">
      {/* Back */}
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5">
        <ArrowLeft className="w-4 h-4" /> Back to Tenders
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-teal-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${isClosed ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}`}>
                {isClosed ? 'Closed' : 'Open'}
              </span>
              {tender.category && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 bg-teal-50 text-teal-700 rounded-full text-xs font-medium">
                  <Tag className="w-3 h-3" /> {tender.category}
                </span>
              )}
              {isDeadline && !isClosed && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 bg-red-50 text-red-600 rounded-full text-xs font-medium">
                  <AlertCircle className="w-3 h-3" /> Deadline passed
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{tender.title}</h2>
            {tender.description && (
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">{tender.description}</p>
            )}
          </div>
        </div>

        {/* Meta row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100">
          {tender.deadline && (
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Deadline</p>
              <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                {new Date(tender.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          )}
          {tender.budget && (
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Budget</p>
              <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                AED {fmt(tender.budget)}
              </p>
            </div>
          )}
          {tender.quantity && (
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Quantity</p>
              <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-gray-400" />
                {tender.quantity} {tender.unit || 'units'}
              </p>
            </div>
          )}
          {tender.company_name && (
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Issuing Company</p>
              <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-gray-400" />
                {tender.company_name}
              </p>
            </div>
          )}
        </div>

        {/* Specifications */}
        {tender.specifications && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-700 mb-2">Specifications</p>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{tender.specifications}</p>
          </div>
        )}
      </div>

      {/* My Quote Status */}
      {myQuote && (
        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-5 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-teal-800">Your Quote Submitted</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-teal-600">Unit Price</p>
              <p className="font-bold text-teal-900">AED {fmt(myQuote.unit_price)}</p>
            </div>
            {myQuote.delivery_days && (
              <div>
                <p className="text-xs text-teal-600">Delivery</p>
                <p className="font-bold text-teal-900">{myQuote.delivery_days} days</p>
              </div>
            )}
            {myQuote.validity_days && (
              <div>
                <p className="text-xs text-teal-600">Valid For</p>
                <p className="font-bold text-teal-900">{myQuote.validity_days} days</p>
              </div>
            )}
            <div>
              <p className="text-xs text-teal-600">Submitted</p>
              <p className="font-bold text-teal-900">{new Date(myQuote.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          {myQuote.notes && (
            <p className="text-sm text-teal-700 mt-3 pt-3 border-t border-teal-200">{myQuote.notes}</p>
          )}
        </div>
      )}

      {success && !myQuote && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 mb-5">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-semibold">Quote submitted successfully!</p>
        </div>
      )}

      {/* Submit Quote Section */}
      {canQuote && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <button
            onClick={() => setShowForm(f => !f)}
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 rounded-2xl transition-colors"
          >
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-teal-600" />
              <span className="font-bold text-gray-900">Submit Your Quote</span>
            </div>
            {showForm ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>

          {showForm && (
            <form onSubmit={handleSubmit} className="px-6 pb-6 border-t border-gray-100 pt-5">
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mb-4 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Unit Price (AED) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">AED</span>
                    <input
                      type="number" step="0.01" min="0.01"
                      value={form.unit_price}
                      onChange={set('unit_price')}
                      placeholder="0.00"
                      required
                      className="w-full border border-gray-300 rounded-xl pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Delivery Time (days)</label>
                  <input
                    type="number" min="1"
                    value={form.delivery_days}
                    onChange={set('delivery_days')}
                    placeholder="e.g. 14"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Quote Validity (days)</label>
                  <input
                    type="number" min="1"
                    value={form.validity_days}
                    onChange={set('validity_days')}
                    placeholder="30"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notes / Remarks</label>
                <textarea
                  value={form.notes}
                  onChange={set('notes')}
                  rows={3}
                  placeholder="Any additional details, terms, or conditions…"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting…</>
                  ) : (
                    <><Send className="w-4 h-4" /> Submit Quote</>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {isClosed && !myQuote && (
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 text-center">
          <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 font-medium">This tender is closed</p>
          <p className="text-sm text-gray-400 mt-1">Quote submission is no longer available</p>
          <Link href="/vendor/tenders" className="inline-block mt-4 text-sm text-teal-600 hover:underline">
            Browse other tenders
          </Link>
        </div>
      )}
    </div>
  )
}
