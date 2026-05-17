import { SignJWT, jwtVerify } from 'jose'

function secret() {
  return new TextEncoder().encode(
    process.env.JWT_SECRET || 'purchase-approval-secret-2024'
  )
}

export async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret())
}

export async function verifyToken(token) {
  const { payload } = await jwtVerify(token, secret())
  return payload
}
