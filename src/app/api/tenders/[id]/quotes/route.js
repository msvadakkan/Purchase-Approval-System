import { NextResponse } from 'next/server'
import { col } from '@/lib/db'
import { getUser } from '@/lib/auth'
import { normalizeMany, toObjectId } from '@/lib/helpers'

export async function GET(request, { params }) {
  try {
    const user = await getUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role === 'vendor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const oid = toObjectId(params.id)
    if (!oid) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

    const docs = await (await col('quotes'))
      .find({ tender_id: oid }, { sort: { total_amount: 1 } }).toArray()
    return NextResponse.json(normalizeMany(docs))
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
