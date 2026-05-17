import { NextResponse } from 'next/server'
import { col } from '@/lib/db'
import { getUser } from '@/lib/auth'
import { toObjectId } from '@/lib/helpers'

export async function POST(request, { params }) {
  try {
    const user = await getUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'vendor') return NextResponse.json({ error: 'Only vendors can submit quotes' }, { status: 403 })

    const oid = toObjectId(params.id)
    if (!oid) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

    const tender = await (await col('tenders')).findOne({ _id: oid })
    if (!tender) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (tender.status !== 'open') return NextResponse.json({ error: 'Tender is closed' }, { status: 400 })

    const body = await request.json()
    const vendorId = toObjectId(user.id)
    const existing = await (await col('quotes')).findOne({ tender_id: oid, vendor_id: vendorId })

    const data = {
      tender_id: oid, tender_title: tender.title,
      vendor_id: vendorId, vendor_name: user.company_name || user.name,
      unit_price:    Number(body.unit_price   || 0),
      total_amount:  Number(body.total_amount  || 0),
      currency:      body.currency      || 'AED',
      delivery_days: Number(body.delivery_days || 0),
      validity_days: Number(body.validity_days || 30),
      payment_terms: body.payment_terms || '',
      warranty:      body.warranty      || '',
      notes:         body.notes         || '',
      submitted_at:  new Date(),
    }

    if (existing) {
      await (await col('quotes')).updateOne({ _id: existing._id }, { $set: data })
      return NextResponse.json({ message: 'Quote updated' })
    }
    await (await col('quotes')).insertOne(data)
    return NextResponse.json({ message: 'Quote submitted' }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
