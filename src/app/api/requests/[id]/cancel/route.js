import { NextResponse } from 'next/server'
import { col } from '@/lib/db'
import { getUser } from '@/lib/auth'
import { toObjectId } from '@/lib/helpers'

export async function POST(request, { params }) {
  try {
    const user = await getUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const oid = toObjectId(params.id)
    if (!oid) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

    const doc = await (await col('purchase_requests')).findOne({ _id: oid })
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (doc.requester_id.toString() !== user.id && user.role !== 'admin')
      return NextResponse.json({ error: 'Can only cancel your own requests' }, { status: 403 })
    if (doc.status !== 'pending')
      return NextResponse.json({ error: 'Can only cancel pending requests' }, { status: 400 })

    await (await col('purchase_requests')).updateOne(
      { _id: oid }, { $set: { status: 'cancelled', updated_at: new Date() } }
    )
    return NextResponse.json({ message: 'Request cancelled' })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
