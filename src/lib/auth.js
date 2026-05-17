import { NextResponse } from 'next/server'
import { verifyToken } from './jwt'

export async function getUser(request) {
  const auth = request.headers.get('Authorization') || ''
  const token = auth.replace('Bearer ', '').trim()
  if (!token) return null
  try {
    return await verifyToken(token)
  } catch {
    return null
  }
}

export function forbidden(msg = 'Forbidden') {
  return NextResponse.json({ error: msg }, { status: 403 })
}

export function unauthorized(msg = 'Unauthorized') {
  return NextResponse.json({ error: msg }, { status: 401 })
}

export function badRequest(msg) {
  return NextResponse.json({ error: msg }, { status: 400 })
}

export function notFound(msg = 'Not found') {
  return NextResponse.json({ error: msg }, { status: 404 })
}

export function ok(data, status = 200) {
  return NextResponse.json(data, { status })
}
