import { NextResponse } from 'next/server'
import { col } from '@/lib/db'
import { getUser } from '@/lib/auth'
import { normalize, toObjectId } from '@/lib/helpers'

export async function GET(request) {
  try {
    const user = await getUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const filter = user.role === 'vendor' ? { status: 'open' } : {}
    const docs = await (await col('tenders')).find(filter, { sort: { created_at: -1 } }).toArray()

    const rows = await Promise.all(docs.map(async doc => {
      const row = normalize(doc)
      row.quote_count = await (await col('quotes')).countDocuments({ tender_id: doc._id })
      return row
    }))
    return NextResponse.json(rows)
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const user = await getUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role === 'vendor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    if (!body.title?.trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

    const result = await (await col('tenders')).insertOne({
      title: body.title.trim(),
      description: body.description || '',
      category: body.category || '',
      department: body.department || '',
      deadline: body.deadline || null,
      budget: body.budget ? Number(body.budget) : null,
      specifications: body.specifications || '',
      status: 'open',
      created_by: toObjectId(user.id),
      creator_name: user.name,
      created_at: new Date(), updated_at: new Date(),
    })
    const doc = await (await col('tenders')).findOne({ _id: result.insertedId })
    return NextResponse.json(normalize(doc), { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
