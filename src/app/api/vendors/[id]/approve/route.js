import { NextResponse } from 'next/server'
import { col } from '@/lib/db'
import { getUser } from '@/lib/auth'
import { toObjectId } from '@/lib/helpers'

export async function POST(request, { params }) {
  try {
    const user = await getUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const oid = toObjectId(params.id)
    if (!oid) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

    await (await col('vendors')).updateOne({ _id: oid }, { $set: { status: 'approved' } })
    return NextResponse.json({ message: 'Vendor approved' })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
