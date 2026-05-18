import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const tenantId  = process.env.AZURE_AD_TENANT_ID
  const clientId  = process.env.AZURE_AD_CLIENT_ID
  const appUrl    = process.env.NEXTAUTH_URL || process.env.APP_URL || ''

  if (!tenantId || !clientId) {
    return NextResponse.redirect(`${appUrl}/login?ms_error=not_configured`)
  }

  const state = crypto.randomUUID()

  const params = new URLSearchParams({
    client_id:     clientId,
    response_type: 'code',
    redirect_uri:  `${appUrl}/api/auth/microsoft/callback`,
    scope:         'openid profile email User.Read',
    state,
    response_mode: 'query',
    prompt:        'select_account',
  })

  const cookieStore = await cookies()
  cookieStore.set('ms_oauth_state', state, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    maxAge:   300,
    sameSite: 'lax',
    path:     '/',
  })

  return NextResponse.redirect(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?${params}`
  )
}
