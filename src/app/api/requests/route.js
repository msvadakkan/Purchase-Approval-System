import { NextResponse } from 'next/server'
import { col } from '@/lib/db'
import { getUser } from '@/lib/auth'
import { normalize, toObjectId } from '@/lib/helpers'

const APPROVER_ROLES = ['admin', 'ceo', 'department_head', 'manager']

async function enrich(doc) {
  const row = normalize(doc)
  const requester = await (await col('users')).findOne({ _id: doc.requester_id })
  row.requester_name = requester?.name ?? 'Unknown'
  row.department = requester?.department ?? ''
  return row
}

export async function GET(request) {
  try {
    const user = await getUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const requests = await col('purchase_requests')
    let docs

    if (user.role === 'admin') {
      docs = await requests.find({}, { sort: { created_at: -1 } }).toArray()
    } else if (APPROVER_ROLES.includes(user.role)) {
      const myId = toObjectId(user.id)
      const acted = await (await col('approval_history'))
        .distinct('request_id', { approver_id: myId })
      docs = await requests.find({
        $or: [
          { current_approver_role: user.role },
          { requester_id: myId },
          { _id: { $in: acted } },
        ],
      }, { sort: { created_at: -1 } }).toArray()
    } else {
      docs = await requests.find(
        { requester_id: toObjectId(user.id) },
        { sort: { created_at: -1 } }
      ).toArray()
    }

    return NextResponse.json(await Promise.all(docs.map(enrich)))
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const user = await getUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { title, amount, category, description } = body
    if (!title || !amount || !category)
      return NextResponse.json({ error: 'Title, amount, and category are required' }, { status: 400 })
    if (Number(amount) <= 0)
      return NextResponse.json({ error: 'Amount must be positive' }, { status: 400 })

    const levels = await (await col('approval_levels'))
      .find({}, { sort: { max_amount: 1 } }).toArray()
    let approverRole = 'ceo'
    for (const lvl of levels) {
      if (Number(amount) <= lvl.max_amount) { approverRole = lvl.role; break }
    }

    const result = await (await col('purchase_requests')).insertOne({
      title, description: description || null,
      amount: Number(amount), category,
      requester_id: toObjectId(user.id),
      status: 'pending',
      current_approver_role: approverRole,
      created_at: new Date(), updated_at: new Date(),
    })

    const doc = await (await col('purchase_requests')).findOne({ _id: result.insertedId })
    return NextResponse.json(await enrich(doc), { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
