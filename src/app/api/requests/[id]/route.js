import { NextResponse } from 'next/server'
import { col } from '@/lib/db'
import { getUser } from '@/lib/auth'
import { normalize, normalizeMany, toObjectId } from '@/lib/helpers'

async function enrich(doc) {
  const row = normalize(doc)
  const requester = await (await col('users')).findOne({ _id: doc.requester_id })
  row.requester_name = requester?.name ?? 'Unknown'
  row.department = requester?.department ?? ''
  return row
}

export async function GET(request, { params }) {
  try {
    const user = await getUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const oid = toObjectId(params.id)
    if (!oid) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

    const doc = await (await col('purchase_requests')).findOne({ _id: oid })
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (user.role === 'employee' && doc.requester_id.toString() !== user.id)
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })

    const row = await enrich(doc)
    const hist = await (await col('approval_history'))
      .find({ request_id: oid }, { sort: { created_at: 1 } }).toArray()
    row.history = normalizeMany(hist)
    return NextResponse.json(row)
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
