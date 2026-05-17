import { NextResponse } from 'next/server'
import { col } from '@/lib/db'
import { getUser } from '@/lib/auth'
import { normalizeMany } from '@/lib/helpers'

export async function GET(request) {
  try {
    const user = await getUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const docs = await (await col('approval_levels'))
      .find({}, { sort: { max_amount: 1 } }).toArray()
    return NextResponse.json(normalizeMany(docs))
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const user = await getUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const levels = await request.json()
    const levelsCol = await col('approval_levels')
    for (const lvl of levels) {
      await levelsCol.updateOne(
        { role: lvl.role },
        { $set: { max_amount: Number(lvl.max_amount), updated_at: new Date() } },
        { upsert: true }
      )
    }
    return NextResponse.json({ message: 'Approval levels updated' })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
