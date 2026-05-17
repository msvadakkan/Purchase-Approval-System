import { NextResponse } from 'next/server'
import { col } from '@/lib/db'
import { getUser } from '@/lib/auth'

export async function GET(request) {
  try {
    const user = await getUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const requests = await col('purchase_requests')
    const [total, pending, approved, rejected, users, vendors, companies] = await Promise.all([
      requests.countDocuments({}),
      requests.countDocuments({ status: 'pending' }),
      requests.countDocuments({ status: 'approved' }),
      requests.countDocuments({ status: 'rejected' }),
      (await col('users')).countDocuments({}),
      (await col('vendors')).countDocuments({}),
      (await col('companies')).countDocuments({}),
    ])

    const approvedDocs = await requests.find({ status: 'approved' }, { projection: { amount: 1 } }).toArray()
    const totalApprovedAmount = approvedDocs.reduce((s, d) => s + (Number(d.amount) || 0), 0)

    return NextResponse.json({
      total_requests: total, pending, approved, rejected,
      total_users: users, total_vendors: vendors, total_companies: companies,
      total_approved_amount: totalApprovedAmount,
    })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
