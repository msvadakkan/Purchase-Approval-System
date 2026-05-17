import { NextResponse } from 'next/server'
import { col } from '@/lib/db'
import { getUser } from '@/lib/auth'
import { normalize, normalizeMany, toObjectId } from '@/lib/helpers'

export async function GET(request) {
  try {
    const user = await getUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let filter = {}
    if (user.role !== 'admin') {
      const companyDocs = await (await col('companies'))
        .find({ owner_id: user.id }, { projection: { _id: 1 } }).toArray()
      const ids = companyDocs.map(c => c._id.toString())
      filter = ids.length ? { company_id: { $in: ids } } : { company_id: '__none__' }
    }
    const docs = await (await col('lpos')).find(filter, { sort: { created_at: -1 } }).toArray()
    return NextResponse.json(normalizeMany(docs))
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const user = await getUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    if (!body.company_id) return NextResponse.json({ error: 'Company is required' }, { status: 400 })
    if (!body.vendor_id)  return NextResponse.json({ error: 'Vendor is required' }, { status: 400 })
    if (!body.items?.length) return NextResponse.json({ error: 'At least one line item required' }, { status: 400 })

    const cOid = toObjectId(body.company_id)
    const vOid = toObjectId(body.vendor_id)
    if (!cOid) return NextResponse.json({ error: 'Invalid company ID' }, { status: 400 })
    if (!vOid) return NextResponse.json({ error: 'Invalid vendor ID' }, { status: 400 })

    const company = await (await col('companies')).findOne({ _id: cOid })
    if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    const vendor = await (await col('vendors')).findOne({ _id: vOid })
    if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

    const seq = await (await col('lpos')).countDocuments({ company_id: body.company_id })
    const lpo_number = `LPO-${new Date().getFullYear()}-${String(seq + 1).padStart(4, '0')}`

    let subtotal = 0
    const items = body.items.map(item => {
      const qty   = Number(item.quantity  || 1)
      const price = Number(item.unit_price || 0)
      const total = Math.round(qty * price * 100) / 100
      subtotal += total
      return { description: item.description?.trim() || '', quantity: qty, unit: item.unit || 'pcs', unit_price: price, total }
    })
    const vatRate   = Number(body.vat_rate ?? 5)
    const vatAmount = Math.round(subtotal * (vatRate / 100) * 100) / 100
    const total     = Math.round((subtotal + vatAmount) * 100) / 100

    const companySnap = normalize(company)
    const vendorSnap  = normalize(vendor)
    delete vendorSnap.password_hash

    const result = await (await col('lpos')).insertOne({
      lpo_number, company_id: body.company_id,
      company_snapshot: companySnap,
      vendor_id: body.vendor_id, vendor_snapshot: vendorSnap,
      request_id:    body.request_id    || null,
      issue_date:    body.issue_date    || new Date().toISOString().slice(0, 10),
      delivery_date: body.delivery_date || null,
      payment_terms: body.payment_terms || 'Net 30 days',
      items, subtotal, vat_rate: vatRate, vat_amount: vatAmount, total_amount: total,
      currency:       body.currency       || 'AED',
      notes:          body.notes          || '',
      status: 'draft',
      created_by: user.id, created_by_name: user.name || '',
      created_at: new Date(),
    })
    return NextResponse.json({ id: result.insertedId.toString(), lpo_number }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
