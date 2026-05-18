'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Building2, Mail, Lock, ChevronRight, AlertCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const MS_ERROR_MESSAGES = {
  not_configured:       'Microsoft login is not configured. Use email & password below.',
  invalid_state:        'Security check failed. Please try again.',
  token_exchange_failed:'Microsoft authentication failed. Please try again.',
  graph_api_failed:     'Could not retrieve your Microsoft profile. Please try again.',
  no_email:             'No email found in your Microsoft account.',
  default:              'Microsoft sign-in failed. Please use email & password.',
}

const DEMO_ACCOUNTS = [
  { role: 'Admin',     email: 'admin@magenta-investments.com',    password: 'admin123',    color: 'bg-purple-100 text-purple-700' },
  { role: 'CEO',       email: 'ceo@magenta-investments.com',      password: 'password123', color: 'bg-yellow-100 text-yellow-700' },
  { role: 'Dept Head', email: 'depthead@magenta-investments.com', password: 'password123', color: 'bg-blue-100   text-blue-700'   },
  { role: 'Manager',   email: 'manager@magenta-investments.com',  password: 'password123', color: 'bg-green-100  text-green-700'  },
  { role: 'Employee',  email: 'alice@magenta-investments.com',    password: 'password123', color: 'bg-gray-100   text-gray-700'   },
]

function LoginContent() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { user, login }         = useAuth()
  const router                  = useRouter()
  const searchParams            = useSearchParams()

  useEffect(() => { if (user) router.replace('/dashboard') }, [user, router])

  useEffect(() => {
    const msErr = searchParams.get('ms_error')
    if (msErr) {
      const decoded = decodeURIComponent(msErr)
      setError(MS_ERROR_MESSAGES[decoded] || decoded || MS_ERROR_MESSAGES.default)
    }
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-violet-800 to-indigo-600 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-700/30 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-violet-700 to-violet-500 px-8 py-6 text-center">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Magenta Investments LLC</h1>
            <p className="text-violet-200 text-sm mt-0.5">Purchase Approval System</p>
          </div>

          <div className="px-8 py-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Microsoft 365 Sign-In */}
            <button
              type="button"
              onClick={() => { window.location.href = '/api/auth/microsoft/redirect' }}
              className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
                <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
                <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
                <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
              </svg>
              Sign in with Microsoft 365
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-gray-400 font-medium">or use email &amp; password</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="you@magenta-investments.com" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="••••••••" required />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-violet-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-violet-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? 'Signing in…' : <><span>Sign In</span><ChevronRight className="w-4 h-4" /></>}
              </button>
            </form>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Quick access — demo accounts</p>
              <div className="space-y-1">
                {DEMO_ACCOUNTS.map(({ role, email: em, password: pw, color }) => (
                  <button key={em} type="button" onClick={() => { setEmail(em); setPassword(pw) }}
                    className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors group">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${color}`}>{role}</span>
                    <span className="text-xs text-gray-400 group-hover:text-gray-600">{em}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-violet-300 text-xs mt-4">
          Vendor?{' '}
          <Link href="/vendor/login" className="text-white font-medium hover:underline">Sign in to Vendor Portal →</Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
