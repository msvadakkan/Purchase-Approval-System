import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import { getUser } from '@/lib/auth'

export async function GET(request, { params }) {
  try {
    const user = await getUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const segments = params.path || []
    const filePath = path.join(process.cwd(), 'uploads', ...segments)
    const resolved = path.resolve(filePath)
    const base     = path.resolve(path.join(process.cwd(), 'uploads'))

    if (!resolved.startsWith(base))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const data = await readFile(resolved)
    const ext  = path.extname(resolved).toLowerCase()
    const mime = {
      '.pdf': 'application/pdf', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
      '.png': 'image/png', '.gif': 'image/gif',
    }[ext] ?? 'application/octet-stream'

    return new NextResponse(data, { headers: { 'Content-Type': mime } })
  } catch (e) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
