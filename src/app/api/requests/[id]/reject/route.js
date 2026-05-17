import { NextResponse } from 'next/server'
import { col } from '@/lib/db'
import { getUser } from '@/lib/auth'
import { toObjectId } from '@/lib/helpers'

const APPROVER_ROLES = ['admin', 'ceo', 'department_head', 'manager']

export async function POST(request, { params }) {
  try {
    const user = await getUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!APPROVER_ROLES.includes(user.role))
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

    const oid = toObjectId(params.id)
    if (!oid) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

    const body = await request.json().catch(() => ({}))
    const doc = await (await col('purchase_requests')).findOne({ _id: oid })
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (doc.status !== 'pending') return NextResponse.json({ error: 'Request is not pending' }, { status: 400 })
    if (user.role !== 'admin' && doc.current_approver_role !== user.role)
      return NextResponse.json({ error: 'Not assigned to your approval level' }, { status: 403 })

    await (await col('purchase_requests')).updateOne(
      { _id: oid },
      { $set: { status: 'rejected', current_approver_role: null, updated_at: new Date() } }
    )
    await (await col('approval_history')).insertOne({
      request_id: oid, approver_id: toObjectId(user.id),
      approver_name: user.name, approver_role: user.role,
      action: 'rejected', comments: body.comments || null, created_at: new Date(),
    })
    return NextResponse.json({ message: 'Request rejected' })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
