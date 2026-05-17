import { NextResponse } from 'next/server'
import { col } from '@/lib/db'
import { getUser } from '@/lib/auth'
import { normalize } from '@/lib/helpers'

const APPROVER_ROLES = ['admin', 'ceo', 'department_head', 'manager']

export async function GET(request) {
  try {
    const user = await getUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!APPROVER_ROLES.includes(user.role)) return NextResponse.json([])

    const filter = user.role === 'admin'
      ? { status: 'pending' }
      : { status: 'pending', current_approver_role: user.role }

    const docs = await (await col('purchase_requests'))
      .find(filter, { sort: { created_at: -1 } }).toArray()

    const rows = await Promise.all(docs.map(async doc => {
      const row = normalize(doc)
      const requester = await (await col('users')).findOne({ _id: doc.requester_id })
      row.requester_name = requester?.name ?? 'Unknown'
      row.department = requester?.department ?? ''
      return row
    }))
    return NextResponse.json(rows)
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
