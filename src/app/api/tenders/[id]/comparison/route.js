import { NextResponse } from 'next/server'
import { col } from '@/lib/db'
import { getUser } from '@/lib/auth'
import { normalize, normalizeMany, toObjectId } from '@/lib/helpers'

export async function GET(request, { params }) {
  try {
    const user = await getUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role === 'vendor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const oid = toObjectId(params.id)
    if (!oid) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

    const tender = await (await col('tenders')).findOne({ _id: oid })
    if (!tender) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const quotes = await (await col('quotes'))
      .find({ tender_id: oid }, { sort: { total_amount: 1 } }).toArray()
    const rows = normalizeMany(quotes)

    if (rows.length) {
      const min = Math.min(...rows.map(q => q.total_amount))
      rows.forEach(q => { q.is_lowest = q.total_amount === min })
    }
    return NextResponse.json({ tender: normalize(tender), quotes: rows })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
