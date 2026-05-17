import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { col } from '@/lib/db'
import { signToken } from '@/lib/jwt'
import { normalize } from '@/lib/helpers'

export async function POST(request) {
  try {
    const { email, password } = await request.json()
    if (!email || !password)
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })

    const vendor = await (await col('vendors')).findOne({ email: email.trim() })
    if (!vendor || !(await bcrypt.compare(password, vendor.password_hash)))
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    if (vendor.status !== 'approved')
      return NextResponse.json({ error: 'Your account is pending admin approval' }, { status: 403 })

    const token = await signToken({
      id: vendor._id.toString(), email: vendor.email,
      company_name: vendor.company_name, role: 'vendor', type: 'vendor',
    })
    const row = normalize(vendor)
    delete row.password_hash
    return NextResponse.json({ token, vendor: row })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
