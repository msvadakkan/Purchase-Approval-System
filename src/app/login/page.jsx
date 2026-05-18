'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, ChevronRight, AlertCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const MS_ERROR_MESSAGES = {
  not_configured:       'Microsoft login is not configured. Use email & password below.',
  invalid_state:        'Security check failed. Please try again.',
  token_exchange_failed:'Microsoft authentication failed. Please try again.',
  graph_api_failed:     'Could not retrieve your Microsoft profile. Please try again.',
  no_email:             'No email found in your Microsoft account.',
  default:              'Microsoft sign-in failed. Please use email & password.',
}

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
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-violet-800 to-indigo-700 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-700/30 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center border-b border-gray-100">
            <img
              src="https://magenta-investments.com/wp-content/uploads/2025/08/Logo.png"
              alt="Magenta Investments LLC"
              className="h-10 w-auto mx-auto mb-4 object-contain"
              onError={e => { e.target.style.display = 'none' }}
            />
            <p className="text-gray-500 text-sm">Purchase Approval System — Staff Login</p>
          </div>

          <div className="px-8 py-6 space-y-4">
            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Microsoft 365 */}
            <button
              type="button"
              onClick={() => { window.location.href = '/api/auth/microsoft/redirect' }}
              className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 21 21" fill="none">
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
                <span className="bg-white px-3 text-gray-400 font-medium">or email &amp; password</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="you@magenta-investments.com" required autoComplete="email" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="••••••••" required autoComplete="current-password" />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-violet-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-violet-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? 'Signing in…' : <><span>Sign In</span><ChevronRight className="w-4 h-4" /></>}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-violet-300 text-xs mt-4">
          Vendor?{' '}
          <Link href="/vendor/login" className="text-white font-medium hover:underline">Vendor Portal →</Link>
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
