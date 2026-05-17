import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { col } from '@/lib/db'
import { getUser } from '@/lib/auth'
import { normalize, normalizeMany } from '@/lib/helpers'

export async function GET(request) {
  try {
    const user = await getUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const filter = user.role === 'admin' ? {} : { owner_id: user.id }
    const docs = await (await col('companies')).find(filter, { sort: { created_at: -1 } }).toArray()
    return NextResponse.json(normalizeMany(docs))
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const user = await getUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await request.formData()
    const name  = formData.get('name')?.trim()
    const email = formData.get('email')?.trim()
    if (!name)  return NextResponse.json({ error: 'Company name is required' }, { status: 400 })
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

    let logo_filename = null
    const logoFile = formData.get('logo')
    if (logoFile && logoFile instanceof File && logoFile.size > 0) {
      const dir = path.join(process.cwd(), 'uploads', 'companies')
      await mkdir(dir, { recursive: true })
      const ext = logoFile.name.split('.').pop()
      logo_filename = `logo_${Date.now()}.${ext}`
      await writeFile(path.join(dir, logo_filename), Buffer.from(await logoFile.arrayBuffer()))
    }

    const result = await (await col('companies')).insertOne({
      name, email, logo_filename,
      trade_license_no: formData.get('trade_license_no') || '',
      vat_number:       formData.get('vat_number')       || '',
      address:          formData.get('address')          || '',
      city:             formData.get('city')             || '',
      country:          formData.get('country')          || 'UAE',
      phone:            formData.get('phone')            || '',
      website:          formData.get('website')          || '',
      owner_id: user.id,
      created_at: new Date(),
    })
    return NextResponse.json({ id: result.insertedId.toString(), name }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
