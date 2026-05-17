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

    const doc = await (await col('companies')).findOne({ _id: oid })
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (user.role !== 'admin' && doc.owner_id !== user.id)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

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

    const doc = await (await col('companies')).findOne({ _id: oid })
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (user.role !== 'admin' && doc.owner_id !== user.id)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const set = {}
    for (const f of ['name','trade_license_no','vat_number','address','city','country','phone','email','website']) {
      if (body[f] !== undefined) set[f] = body[f]
    }
    if (!Object.keys(set).length) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })

    await (await col('companies')).updateOne({ _id: oid }, { $set: set })
    return NextResponse.json({ message: 'Company updated' })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const oid = toObjectId(params.id)
    if (!oid) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

    const doc = await (await col('companies')).findOne({ _id: oid })
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (user.role !== 'admin' && doc.owner_id !== user.id)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await (await col('companies')).deleteOne({ _id: oid })
    return NextResponse.json({ message: 'Company deleted' })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
