import { NextResponse } from 'next/server'
import { col } from '@/lib/db'
import { getUser } from '@/lib/auth'
import { normalize, toObjectId } from '@/lib/helpers'

export async function GET(request) {
  try {
    const user = await getUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let filter = {}

    if (user.role === 'vendor') {
      filter = { status: 'open' }
    } else if (!['admin', 'ceo'].includes(user.role)) {
      // Look up the live user record for dept + permission flag
      const dbUser = await (await col('users')).findOne(
        { _id: toObjectId(user.id) },
        { projection: { can_view_tenders: 1, department: 1 } }
      )

      if (user.role === 'department_head') {
        // Dept heads always have access; scoped to their department if set
        if (dbUser?.department) filter = { department: dbUser.department }
      } else {
        // Managers & employees need explicit permission
        if (!dbUser?.can_view_tenders) return NextResponse.json([])
        if (dbUser?.department) filter = { department: dbUser.department }
      }
    }

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
    if (!body.department?.trim()) return NextResponse.json({ error: 'Department is required' }, { status: 400 })

    const result = await (await col('tenders')).insertOne({
      title:          body.title.trim(),
      description:    body.description || '',
      category:       body.category || '',
      department:     body.department.trim(),
      deadline:       body.deadline || null,
      budget:         body.budget ? Number(body.budget) : null,
      specifications: body.specifications || '',
      status:         'open',
      created_by:     toObjectId(user.id),
      creator_name:   user.name,
      created_at:     new Date(),
      updated_at:     new Date(),
    })
    const doc = await (await col('tenders')).findOne({ _id: result.insertedId })
    return NextResponse.json(normalize(doc), { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
