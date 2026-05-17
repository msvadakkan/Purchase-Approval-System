import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { col } from '@/lib/db'
import { signToken } from '@/lib/jwt'

export async function POST(request) {
  try {
    const { email, password } = await request.json()
    if (!email || !password)
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })

    const users = await col('users')
    const user = await users.findOne({ email: email.trim(), is_active: true })
    if (!user || !(await bcrypt.compare(password, user.password_hash)))
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })

    const token = await signToken({
      id: user._id.toString(), email: user.email,
      role: user.role, name: user.name, type: 'user',
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
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
