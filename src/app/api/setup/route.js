import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { col } from '@/lib/db'
import { seed } from '@/lib/seed'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Check if setup is needed (no admin exists yet)
export async function GET() {
  try {
    const count = await (await col('users')).countDocuments({ role: 'admin' })
    return NextResponse.json({ setup_required: count === 0 })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// Create the first admin account (only works when no admin exists)
export async function POST(request) {
  try {
    const users = await col('users')
    const existing = await users.countDocuments({ role: 'admin' })
    if (existing > 0) {
      return NextResponse.json(
        { error: 'Setup already complete. An admin account already exists.' },
        { status: 409 }
      )
    }

    let body
    try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

    const { name, email, password } = body
    if (!name?.trim() || !email?.trim() || !password)
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 })
    if (!EMAIL_RE.test(email))
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    if (password.length < 8)
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })

    // Ensure base data (approval levels, company) exists
    await seed()

    const result = await users.insertOne({
      name:          name.trim(),
      email:         email.trim().toLowerCase(),
      role:          'admin',
      department:    'Management',
      is_active:     true,
      password_hash: await bcrypt.hash(password, 12),
      created_at:    new Date(),
    })

    return NextResponse.json({ id: result.insertedId.toString(), message: 'Admin account created' }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
