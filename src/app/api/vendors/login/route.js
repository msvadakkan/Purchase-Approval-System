import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { col } from '@/lib/db'
import { signToken } from '@/lib/jwt'
import { normalize } from '@/lib/helpers'
import { rateLimit } from '@/lib/rateLimit'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request) {
  // Rate limit: 10 attempts per IP per 15 minutes
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown'
  const rl = rateLimit(`vendor-login:${ip}`, 10, 15 * 60_000)
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please wait 15 minutes.' },
      { status: 429, headers: { 'Retry-After': '900' } }
    )
  }

  try {
    let body
    try { body = await request.json() }
    catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

    const { email, password } = body

    // Input validation
    if (!email || !password)
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    if (typeof email !== 'string' || typeof password !== 'string')
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    if (email.length > 254 || password.length > 128)
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    if (!EMAIL_RE.test(email))
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })

    const vendor = await (await col('vendors')).findOne({ email: email.trim().toLowerCase() })

    // Always run bcrypt to prevent timing attacks
    const dummyHash = '$2a$10$invalidsaltinvalidsaltinvalidsaltinvalidsaltinvalidsa'
    const hashToCompare = vendor?.password_hash || dummyHash
    const match = await bcrypt.compare(password, hashToCompare)

    if (!vendor || !match) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }
    if (vendor.status !== 'approved') {
      return NextResponse.json({ error: 'Your account is pending admin approval' }, { status: 403 })
    }

    const token = await signToken({
      id: vendor._id.toString(), email: vendor.email,
      company_name: vendor.company_name, role: 'vendor', type: 'vendor',
    })
    const row = normalize(vendor)
    delete row.password_hash
    return NextResponse.json({ token, vendor: row })
  } catch (e) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
