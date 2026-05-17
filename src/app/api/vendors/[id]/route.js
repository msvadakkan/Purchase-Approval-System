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

    if (user.role !== 'admin' && user.id !== params.id)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const doc = await (await col('vendors')).findOne({ _id: oid })
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const row = normalize(doc)
    delete row.password_hash
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
    const set = {}
    for (const f of ['status', 'company_name', 'vat_number', 'contact_number', 'sales_person', 'address']) {
      if (body[f] !== undefined) set[f] = body[f]
    }
    if (!Object.keys(set).length) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })

    await (await col('vendors')).updateOne({ _id: oid }, { $set: set })
    return NextResponse.json({ message: 'Vendor updated' })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
