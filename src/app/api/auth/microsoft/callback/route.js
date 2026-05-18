import { cookies } from 'next/headers'
import { col } from '@/lib/db'
import { signToken } from '@/lib/jwt'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const code    = searchParams.get('code')
  const state   = searchParams.get('state')
  const msError = searchParams.get('error')
  const appUrl  = process.env.NEXTAUTH_URL || process.env.APP_URL || ''

  const redirect = (err) =>
    new Response(null, { status: 302, headers: { Location: `${appUrl}/login?ms_error=${err}` } })

  if (msError) return redirect(encodeURIComponent(searchParams.get('error_description') || msError))

  // Verify CSRF state
  const cookieStore = await cookies()
  const savedState  = cookieStore.get('ms_oauth_state')?.value
  cookieStore.delete('ms_oauth_state')
  if (!savedState || savedState !== state) return redirect('invalid_state')

  // Exchange authorization code for tokens
  const tokenRes = await fetch(
    `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id:     process.env.AZURE_AD_CLIENT_ID,
        client_secret: process.env.AZURE_AD_CLIENT_SECRET,
        code,
        redirect_uri:  `${appUrl}/api/auth/microsoft/callback`,
        grant_type:    'authorization_code',
        scope:         'openid profile email User.Read',
      }),
    }
  )

  if (!tokenRes.ok) return redirect('token_exchange_failed')
  const tokens = await tokenRes.json()

  // Get profile from Microsoft Graph
  const profileRes = await fetch('https://graph.microsoft.com/v1.0/me?$select=id,displayName,mail,userPrincipalName,jobTitle,department', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })
  if (!profileRes.ok) return redirect('graph_api_failed')
  const profile = await profileRes.json()

  const msEmail = (profile.mail || profile.userPrincipalName || '').toLowerCase()
  if (!msEmail) return redirect('no_email')

  // Look up user in our DB — must be pre-created by admin with matching email
  const users = await col('users')
  const user  = await users.findOne({ email: msEmail, is_active: true })

  if (!user) {
    return redirect(encodeURIComponent(`User ${msEmail} is not registered. Ask your admin to create your account.`))
  }

  // Issue our JWT (same format as password login)
  const token = await signToken({
    sub:        user._id.toString(),
    id:         user._id.toString(),
    name:       user.name,
    email:      user.email,
    role:       user.role,
    department: user.department || '',
  })

  const userJson = JSON.stringify({
    id:         user._id.toString(),
    name:       user.name,
    email:      user.email,
    role:       user.role,
    department: user.department || null,
  })

  // Return HTML page that stores token in localStorage then redirects.
  // This avoids exposing the JWT in the URL or browser history.
  return new Response(
    `<!DOCTYPE html><html><head><title>Signing in…</title>
    <style>body{display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;background:#f8fafc;color:#475569}
    .box{text-align:center}.spinner{width:40px;height:40px;border:4px solid #e2e8f0;border-top-color:#7c3aed;border-radius:50%;animation:spin .7s linear infinite;margin:0 auto 16px}
    @keyframes spin{to{transform:rotate(360deg)}}</style></head>
    <body><div class="box"><div class="spinner"></div><p>Signing in with Microsoft…</p></div>
    <script>
      try {
        localStorage.setItem('token', ${JSON.stringify(token)});
        localStorage.setItem('user', ${JSON.stringify(userJson)});
      } catch(e) {}
      window.location.replace('/dashboard');
    </script></body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  )
}
