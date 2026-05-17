import { NextResponse } from 'next/server'
import { col } from '@/lib/db'
import { getUser } from '@/lib/auth'
import { normalize, toObjectId } from '@/lib/helpers'

export async function GET(request, { params }) {
  try {
    const user = await getUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const oid = toObjectId(params.id)
    if (!oid) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

    const doc = await (await col('tenders')).findOne({ _id: oid })
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const row = normalize(doc)
    row.quote_count = await (await col('quotes')).countDocuments({ tender_id: oid })

    if (user.role === 'vendor') {
      const myQuote = await (await col('quotes')).findOne({
        tender_id: oid, vendor_id: toObjectId(user.id),
      })
      row.my_quote = myQuote ? normalize(myQuote) : null
    }
    return NextResponse.json(row)
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await getUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const oid = toObjectId(params.id)
    if (!oid) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

    const body = await request.json()
    const set = { updated_at: new Date() }
    if (body.status !== undefined) set.status = body.status
    if (body.deadline !== undefined) set.deadline = body.deadline

    await (await col('tenders')).updateOne({ _id: oid }, { $set: set })
    return NextResponse.json({ message: 'Tender updated' })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
