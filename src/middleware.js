import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

// Routes that are public — no JWT required
const PUBLIC_API = [
  '/api/auth/login',
  '/api/auth/microsoft/redirect',
  '/api/auth/microsoft/callback',
  '/api/vendors/login',
  '/api/health',
]

function secret() {
  return new TextEncoder().encode(process.env.JWT_SECRET || 'purchase-approval-secret-2024')
}

function addSecurityHeaders(response) {
  const h = response.headers
  h.set('X-Frame-Options',         'SAMEORIGIN')
  h.set('X-Content-Type-Options',  'nosniff')
  h.set('X-XSS-Protection',        '1; mode=block')
  h.set('Referrer-Policy',         'strict-origin-when-cross-origin')
  h.set('Permissions-Policy',      'camera=(), microphone=(), geolocation=()')
  if (process.env.NODE_ENV === 'production') {
    h.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  }
  return response
}

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // ── Guard API routes ──────────────────────────────────────────────────────
  if (pathname.startsWith('/api/')) {
    const isPublic = PUBLIC_API.some(p => pathname.startsWith(p))

    if (!isPublic) {
      const auth  = request.headers.get('authorization') || ''
      const token = auth.replace(/^Bearer\s+/i, '').trim()

      if (!token) {
        return addSecurityHeaders(
          NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        )
      }

      try {
        await jwtVerify(token, secret())
      } catch {
        return addSecurityHeaders(
          NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
        )
      }
    }
  }

  // ── Block non-GET vendor registration uploads endpoint from external origins ─
  if (pathname.startsWith('/api/uploads') && request.method !== 'GET') {
    return addSecurityHeaders(
      NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
    )
  }

  const response = NextResponse.next()
  return addSecurityHeaders(response)
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
