'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, ArrowLeft, Upload, AlertCircle } from 'lucide-react'
import api from '@/lib/api'
import { useCompany } from '@/context/CompanyContext'

export default function NewCompanyPage() {
  const router = useRouter()
  const { refresh, setActiveCompany } = useCompany()
  const logoRef = useRef(null)

  const [form, setForm] = useState({
    name: '', trade_license_no: '', vat_number: '',
    address: '', city: '', country: 'UAE',
    phone: '', email: '', website: '',
  })
  const [logo, setLogo]       = useState(null)
  const [preview, setPreview] = useState(null)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleLogo = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLogo(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name)  { setError('Company name is required'); return }
    if (!form.email) { setError('Email is required'); return }
    setError(''); setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (logo) fd.append('logo', logo)
      const { data } = await api.post('/companies', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      await refresh()
      const companies = (await api.get('/companies')).data
      const created = companies.find(c => c.id === data.id)
      if (created) setActiveCompany(created)
      router.push('/companies')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create company')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 sm:p-6">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-indigo-600 text-sm hover:underline mb-5">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Register Company</h2>
      <p className="text-gray-500 text-sm mb-6">Add a new company under your account</p>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <div className="flex items-center gap-4">
            <div onClick={() => logoRef.current?.click()}
              className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-indigo-400 overflow-hidden flex-shrink-0 bg-gray-50">
              {preview
                ? <img src={preview} alt="logo" className="w-full h-full object-cover" />
                : <div className="flex flex-col items-center gap-1"><Upload className="w-5 h-5 text-gray-400" /><span className="text-[10px] text-gray-400">Logo</span></div>
              }
            </div>
            <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
            <div>
              <p className="text-sm font-semibold text-gray-700">Company Logo</p>
              <p className="text-xs text-gray-400 mt-0.5">Optional · PNG, JPG up to 2MB</p>
              {logo && <p className="text-xs text-indigo-600 mt-1">{logo.name}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Company Name <span className="text-red-500">*</span></label>
            <input value={form.name} onChange={set('name')}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Alpha Trading LLC" required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Trade License No.</label>
              <input value={form.trade_license_no} onChange={set('trade_license_no')}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="DED-2024-XXXXXX" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">VAT / TRN Number</label>
              <input value={form.vat_number} onChange={set('vat_number')}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="100XXXXXXXXX003" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
              <input type="email" value={form.email} onChange={set('email')}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="info@company.ae" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
              <input value={form.phone} onChange={set('phone')}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="+971 4 123 4567" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Address</label>
            <input value={form.address} onChange={set('address')}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Office 401, Tower A, Business Bay" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">City</label>
              <input value={form.city} onChange={set('city')}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Dubai" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Country</label>
              <input value={form.country} onChange={set('country')}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Website</label>
              <input value={form.website} onChange={set('website')}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="www.company.ae" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button type="button" onClick={() => router.back()}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2">
              <Building2 className="w-4 h-4" />
              {loading ? 'Registering…' : 'Register Company'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
