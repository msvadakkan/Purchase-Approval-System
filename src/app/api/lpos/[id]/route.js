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

    const doc = await (await col('lpos')).findOne({ _id: oid })
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(normalize(doc))
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await getUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const oid = toObjectId(params.id)
    if (!oid) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

    const body = await request.json()
    const set = {}
    for (const f of ['delivery_date', 'payment_terms', 'notes', 'status', 'currency']) {
      if (body[f] !== undefined) set[f] = body[f]
    }
    if (body.items?.length) {
      let subtotal = 0
      set.items = body.items.map(item => {
        const qty   = Number(item.quantity  || 1)
        const price = Number(item.unit_price || 0)
        const total = Math.round(qty * price * 100) / 100
        subtotal += total
        return { description: item.description?.trim() || '', quantity: qty, unit: item.unit || 'pcs', unit_price: price, total }
      })
      const vatRate = Number(body.vat_rate ?? 5)
      set.subtotal    = subtotal
      set.vat_rate    = vatRate
      set.vat_amount  = Math.round(subtotal * (vatRate / 100) * 100) / 100
      set.total_amount = Math.round((subtotal + set.vat_amount) * 100) / 100
    }
    if (!Object.keys(set).length) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })

    await (await col('lpos')).updateOne({ _id: oid }, { $set: set })
    return NextResponse.json({ message: 'LPO updated' })
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

    await (await col('lpos')).deleteOne({ _id: oid })
    return NextResponse.json({ message: 'LPO deleted' })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
