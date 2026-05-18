import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { col } from '@/lib/db'
import { getUser } from '@/lib/auth'
import { normalize } from '@/lib/helpers'

export async function GET(request) {
  try {
    const user = await getUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const docs = await (await col('vendors')).find({}, { sort: { created_at: -1 } }).toArray()
    return NextResponse.json(docs.map(d => {
      const row = normalize(d)
      delete row.password_hash
      return row
    }))
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData()
    const required = ['company_name', 'vat_number', 'contact_number', 'sales_person', 'address', 'email', 'password']
    for (const f of required) {
      if (!formData.get(f)) return NextResponse.json({ error: `Field '${f}' is required` }, { status: 400 })
    }

    const email = formData.get('email')
    if (await (await col('vendors')).countDocuments({ email }))
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })

    const uploadDir = path.join(process.cwd(), 'uploads', 'vendors')
    await mkdir(uploadDir, { recursive: true })

    const attachments = []
    for (const type of ['trade_license', 'vat_certificate', 'bank_document']) {
      const file = formData.get(type)
      if (file && file instanceof File && file.size > 0) {
        const ext = file.name.split('.').pop()
        const filename = `${type}_${Date.now()}.${ext}`
        await writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()))
        attachments.push({ type, filename, original: file.name })
      }
    }

    const bcrypt = (await import('bcryptjs')).default
    const result = await (await col('vendors')).insertOne({
      company_name:   formData.get('company_name'),
      vat_number:     formData.get('vat_number'),
      contact_number: formData.get('contact_number'),
      sales_person:   formData.get('sales_person'),
      address:        formData.get('address'),
      email,
      password_hash:  await bcrypt.hash(formData.get('password'), 10),
      bank_details: {
        bank_name:      formData.get('bank_name')      || '',
        account_name:   formData.get('account_name')   || '',
        account_number: formData.get('account_number') || '',
        iban:           formData.get('iban')           || '',
        swift_code:     formData.get('swift_code')     || '',
        branch:         formData.get('branch')         || '',
      },
      categories:     formData.get('categories') ? formData.get('categories').split(',').map(c => c.trim()).filter(Boolean) : [],
      attachments, status: 'pending', created_at: new Date(),
    })
    return NextResponse.json({ id: result.insertedId.toString(), message: 'Registered. Awaiting approval.' }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
