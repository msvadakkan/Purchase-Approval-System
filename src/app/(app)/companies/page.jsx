'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Building2, Plus, Phone, Mail, Globe, MapPin, Pencil, Trash2 } from 'lucide-react'
import api from '@/lib/api'
import { useCompany } from '@/context/CompanyContext'

export default function CompaniesPage() {
  const { companies, activeCompany, setActiveCompany, refresh } = useCompany()
  const router = useRouter()

  useEffect(() => { refresh() }, [])

  const handleDelete = async (c) => {
    if (!window.confirm(`Delete "${c.name}"? This cannot be undone.`)) return
    try {
      await api.delete(`/companies/${c.id}`)
      if (activeCompany?.id === c.id) setActiveCompany(null)
      refresh()
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed')
    }
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Companies</h2>
          <p className="text-gray-500 text-sm mt-0.5">Manage your registered companies</p>
        </div>
        <Link href="/companies/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Add Company
        </Link>
      </div>

      {companies.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-indigo-400" />
          </div>
          <p className="font-semibold text-gray-600">No companies yet</p>
          <p className="text-sm text-gray-400 mt-1">
            <Link href="/companies/new" className="text-indigo-600 font-medium hover:underline">Register your first company</Link>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {companies.map(c => (
            <div key={c.id}
              className={`bg-white rounded-2xl border-2 p-5 transition-all hover:shadow-md ${
                activeCompany?.id === c.id ? 'border-indigo-400 shadow-md' : 'border-gray-100'
              }`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    {c.logo_filename
                      ? <img src={`/api/uploads/companies/${c.logo_filename}`} alt="" className="w-full h-full object-cover rounded-xl" />
                      : <Building2 className="w-5 h-5 text-indigo-600" />
                    }
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm leading-tight">{c.name}</h3>
                    {c.vat_number && <p className="text-xs text-gray-400 mt-0.5">TRN: {c.vat_number}</p>}
                  </div>
                </div>
                {activeCompany?.id === c.id && (
                  <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full flex-shrink-0">ACTIVE</span>
                )}
              </div>

              <div className="space-y-1.5 text-xs text-gray-500 mb-4">
                {c.address && (
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-gray-400" />
                    <span>{c.address}{c.city ? `, ${c.city}` : ''}</span>
                  </div>
                )}
                {c.phone && <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" /><span>{c.phone}</span></div>}
                {c.email && <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" /><span className="truncate">{c.email}</span></div>}
                {c.website && <div className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" /><span className="truncate">{c.website}</span></div>}
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-50">
                <button onClick={() => setActiveCompany(c)} disabled={activeCompany?.id === c.id}
                  className="flex-1 py-1.5 text-xs font-semibold rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 disabled:opacity-40 disabled:cursor-not-allowed">
                  {activeCompany?.id === c.id ? 'Active' : 'Set Active'}
                </button>
                <button onClick={() => router.push(`/companies/${c.id}/edit`)}
                  className="p-1.5 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(c)}
                  className="p-1.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
