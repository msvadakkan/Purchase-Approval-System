import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { col } from '@/lib/db'
import { signToken } from '@/lib/jwt'
import { rateLimit } from '@/lib/rateLimit'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request) {
  // Rate limit: 10 attempts per IP per 15 minutes
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown'
  const rl = rateLimit(`login:${ip}`, 10, 15 * 60_000)
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
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    if (typeof email !== 'string' || typeof password !== 'string')
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    if (email.length > 254 || password.length > 128)
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    if (!EMAIL_RE.test(email))
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })

    const users = await col('users')
    const user = await users.findOne({ email: email.trim().toLowerCase(), is_active: true })

    // Always run bcrypt to prevent timing attacks that reveal valid emails
    const dummyHash = '$2a$10$invalidsaltinvalidsaltinvalidsaltinvalidsaltinvalidsa'
    const hashToCompare = user?.password_hash || dummyHash
    const match = await bcrypt.compare(password, hashToCompare)

    if (!user || !match) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const token = await signToken({
      id: user._id.toString(), email: user.email,
      role: user.role, name: user.name,
      department: user.department || '',
      type: 'user',
    })

    return NextResponse.json({
      token,
      user: {
        id: user._id.toString(), name: user.name,
        email: user.email, role: user.role,
        department: user.department || '',
      },
    })
  } catch (e) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
