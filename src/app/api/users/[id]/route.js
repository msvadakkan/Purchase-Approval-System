import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { col } from '@/lib/db'
import { getUser } from '@/lib/auth'
import { toObjectId } from '@/lib/helpers'

export async function PUT(request, { params }) {
  try {
    const user = await getUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const oid = toObjectId(params.id)
    if (!oid) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

    const body = await request.json()
    const set = {}
    for (const f of ['name', 'email', 'role', 'department']) {
      if (body[f] !== undefined) set[f] = body[f]
    }
    if (body.is_active !== undefined) set.is_active = body.is_active
    if (body.can_view_tenders !== undefined) set.can_view_tenders = body.can_view_tenders
    if (body.password) set.password_hash = await bcrypt.hash(body.password, 10)
    if (!Object.keys(set).length)
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })

    await (await col('users')).updateOne({ _id: oid }, { $set: set })
    return NextResponse.json({ message: 'User updated' })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const oid = toObjectId(params.id)
    if (!oid) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    if (params.id === user.id)
      return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 })

    await (await col('users')).deleteOne({ _id: oid })
    return NextResponse.json({ message: 'User deleted' })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
