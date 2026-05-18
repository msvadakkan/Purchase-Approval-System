'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'

export default function SetupPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [alreadyDone, setAlreadyDone] = useState(false)
  const [form, setForm]   = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone]   = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  useEffect(() => {
    fetch('/api/setup').then(r => r.json()).then(d => {
      if (!d.setup_required) setAlreadyDone(true)
    }).finally(() => setChecking(false))
  }, [])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Setup failed')
      setDone(true)
      setTimeout(() => router.push('/login'), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-violet-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-violet-800 to-indigo-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-violet-700 to-violet-500 px-8 py-6 text-center">
            <img
              src="https://magenta-investments.com/wp-content/uploads/2025/09/Logo-white.png"
              alt="Magenta Investments LLC"
              className="h-10 w-auto mx-auto mb-3 object-contain"
              onError={e => { e.target.style.display='none' }}
            />
            <h1 className="text-lg font-bold text-white">Initial System Setup</h1>
            <p className="text-violet-200 text-sm mt-0.5">Create your administrator account to get started</p>
          </div>

          <div className="px-8 py-6">

            {alreadyDone && (
              <div className="text-center py-4">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h2 className="font-bold text-gray-900 mb-1">Already configured</h2>
                <p className="text-gray-500 text-sm mb-4">An admin account already exists.</p>
                <button onClick={() => router.push('/login')}
                  className="px-6 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700">
                  Go to Login →
                </button>
              </div>
            )}

            {done && (
              <div className="text-center py-4">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h2 className="font-bold text-gray-900 mb-1">Setup complete!</h2>
                <p className="text-gray-500 text-sm">Redirecting to login…</p>
              </div>
            )}

            {!alreadyDone && !done && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="p-3 bg-violet-50 border border-violet-100 rounded-xl text-xs text-violet-700 leading-relaxed">
                  This creates the <strong>first administrator</strong> account. Additional admins
                  can be added later from the Admin Panel. This page will be inaccessible once
                  an admin account exists.
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name</label>
                  <input value={form.name} onChange={set('name')} required
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="e.g. Ahmed Al Rashidi" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
                  <input type="email" value={form.email} onChange={set('email')} required
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="admin@magenta-investments.com" autoComplete="email" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password <span className="font-normal text-gray-400">(min 8 characters)</span></label>
                  <div className="relative">
                    <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={set('password')} required minLength={8}
                      className="w-full border border-gray-300 rounded-xl px-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                      placeholder="••••••••" autoComplete="new-password" />
                    <button type="button" onClick={() => setShowPwd(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Confirm Password</label>
                  <input type="password" value={form.confirm} onChange={set('confirm')} required
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="••••••••" autoComplete="new-password" />
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-violet-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-violet-700 transition-colors disabled:opacity-60">
                  {loading ? 'Creating account…' : 'Create Admin Account →'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
