'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShoppingBag, Mail, Lock, ChevronRight, AlertCircle } from 'lucide-react'
import { useVendorAuth } from '@/context/VendorAuthContext'

export default function VendorLoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { vendor, login }       = useVendorAuth()
  const router                  = useRouter()

  useEffect(() => { if (vendor) router.replace('/vendor/dashboard') }, [vendor, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      router.push('/vendor/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-950 via-teal-800 to-teal-600 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-700/30 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-8 py-6 text-center">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
              <ShoppingBag className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Vendor Portal</h1>
            <p className="text-teal-200 text-sm mt-0.5">Sign in to submit and manage your quotes</p>
          </div>

          <div className="px-8 py-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="vendor@magenta-investments.com" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="••••••••" required />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-teal-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-teal-700 disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? 'Signing in…' : <><span>Sign In</span><ChevronRight className="w-4 h-4" /></>}
              </button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-6">
              Not registered?{' '}
              <Link href="/vendor/register" className="text-teal-600 font-semibold hover:underline">Register your company</Link>
            </p>
          </div>
        </div>
        <p className="text-center text-teal-300 text-xs mt-4">
          <Link href="/login" className="text-white font-medium hover:underline">← Back to staff login</Link>
        </p>
      </div>
    </div>
  )
}
