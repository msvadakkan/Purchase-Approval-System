import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { col } from '@/lib/db'
import { getUser } from '@/lib/auth'
import { normalize, normalizeMany } from '@/lib/helpers'

export async function GET(request) {
  try {
    const user = await getUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const docs = await (await col('users')).find({}, { sort: { created_at: -1 } }).toArray()
    return NextResponse.json(docs.map(d => {
      const row = normalize(d)
      delete row.password_hash
      return row
    }))
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const user = await getUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { name, email, password, role, department } = body
    if (!name || !email || !password || !role)
      return NextResponse.json({ error: 'Name, email, password, and role are required' }, { status: 400 })

    const users = await col('users')
    if (await users.countDocuments({ email }))
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 })

    const result = await users.insertOne({
      name, email, role, department: department || '',
      is_active: true,
      password_hash: await bcrypt.hash(password, 10),
      created_at: new Date(),
    })
    return NextResponse.json({ id: result.insertedId.toString(), message: 'User created' }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
