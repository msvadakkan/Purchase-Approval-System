import { redirect } from 'next/navigation'
import Link from 'next/link'
import { col } from '@/lib/db'

export const metadata = {
  title: 'Magenta Investments LLC — Procurement Portal',
  description: 'Secure procurement portal for Magenta Investments LLC staff and registered vendors.',
}

const STATS = [
  { value: '500K+', label: 'Clients Served' },
  { value: '20+',   label: 'Years of Excellence' },
  { value: '4.8/5', label: 'Average Rating' },
  { value: '6+',    label: 'Healthcare Brands' },
]

const SUBSIDIARIES = [
  {
    name: 'Magenta Medical',
    desc: 'Hospital operations & integrated medical services',
    logo: 'https://magenta-investments.com/wp-content/uploads/2026/02/magenta-medical.png',
  },
  {
    name: 'RX-Plus',
    desc: 'Compounding pharmacy solutions',
    logo: 'https://magenta-investments.com/wp-content/uploads/2026/01/rx-plus.png',
  },
  {
    name: 'Magenta Home Health',
    desc: 'In-home healthcare & nursing services',
    logo: 'https://magenta-investments.com/wp-content/uploads/2026/01/home-health.png',
  },
  {
    name: 'Good Health',
    desc: 'Community clinics & pharmacy network',
    logo: 'https://magenta-investments.com/wp-content/uploads/2026/01/good-health.png',
  },
  {
    name: 'Health Plus',
    desc: 'Multi-specialty outpatient clinics',
    logo: 'https://magenta-investments.com/wp-content/uploads/2026/01/health-plus.png',
  },
  {
    name: 'Magenta Pharma',
    desc: 'Pharmaceuticals & medical supplies distribution',
    logo: 'https://magenta-investments.com/wp-content/uploads/2026/01/magenta-pharma.png',
  },
]

export default async function LandingPage() {
  // Redirect to setup if no admin exists yet
  try {
    const adminCount = await (await col('users')).countDocuments({ role: 'admin' })
    if (adminCount === 0) redirect('/setup')
  } catch {
    // DB not reachable — still show the landing page
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}>

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav style={{
        background: '#fff', borderBottom: '1px solid #f0e6ff',
        padding: '0 2rem', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: '72px',
        position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 1px 8px rgba(124,58,237,.06)',
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://magenta-investments.com/wp-content/uploads/2025/08/Logo.png"
          alt="Magenta Investments LLC"
          style={{ height: '40px', width: 'auto', objectFit: 'contain' }}
        />
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/login" style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, border: '1.5px solid #7c3aed', color: '#7c3aed', textDecoration: 'none' }}>
            Staff Login
          </Link>
          <Link href="/vendor/login" style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, background: '#7c3aed', color: '#fff', textDecoration: 'none' }}>
            Vendor Portal
          </Link>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #ede9fe 100%)', padding: '5rem 2rem 4rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <span style={{ display: 'inline-block', background: '#ede9fe', color: '#7c3aed', borderRadius: '20px', padding: '0.35rem 1rem', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '.05em', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
            Procurement Management System
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, color: '#1e1035', lineHeight: 1.2, margin: '0 0 1rem' }}>
            Where Innovation Heals,<br /><span style={{ color: '#7c3aed' }}>and Care Leads</span>
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#6b7280', lineHeight: 1.7, margin: '0 0 2.5rem' }}>
            Magenta Investments LLC's secure procurement portal — streamlining purchase approvals,
            vendor management, and tender workflows across all healthcare brands.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 2rem', background: '#7c3aed', color: '#fff', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', boxShadow: '0 4px 16px rgba(124,58,237,.3)' }}>
              🏢 Staff Login
            </Link>
            <Link href="/vendor/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 2rem', background: '#fff', color: '#7c3aed', border: '2px solid #7c3aed', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none' }}>
              🏪 Vendor Portal
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────────── */}
      <section style={{ background: '#7c3aed', padding: '2.5rem 2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', textAlign: 'center' }}>
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: '0.8rem', color: '#ddd6fe', marginTop: '0.35rem', fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Portal Cards ──────────────────────────────────────────────────────── */}
      <section style={{ padding: '4rem 2rem', background: '#fff' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 800, color: '#1e1035', marginBottom: '0.5rem' }}>Access Your Portal</h2>
          <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '2.5rem' }}>
            Two secure portals — one for internal staff, one for registered vendors.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>

            {/* Staff */}
            <div style={{ border: '1.5px solid #ede9fe', borderRadius: '16px', padding: '2rem', background: 'linear-gradient(145deg, #faf5ff, #fff)', boxShadow: '0 4px 24px rgba(124,58,237,.07)' }}>
              <div style={{ width: '52px', height: '52px', background: '#ede9fe', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1.25rem' }}>🏢</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e1035', margin: '0 0 0.5rem' }}>Staff Portal</h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
                For Magenta Investments employees. Submit purchase requests, track approvals, manage tenders, and generate LPOs.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {['Purchase request & approval workflow', 'Department-based tender management', 'Vendor evaluation & LPO issuance', 'Microsoft 365 single sign-on'].map(f => (
                  <li key={f} style={{ fontSize: '0.82rem', color: '#374151', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <span style={{ color: '#7c3aed', flexShrink: 0 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/login" style={{ display: 'block', textAlign: 'center', padding: '0.75rem', background: '#7c3aed', color: '#fff', borderRadius: '10px', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none' }}>
                Sign In with Company Account →
              </Link>
            </div>

            {/* Vendor */}
            <div style={{ border: '1.5px solid #e0f2fe', borderRadius: '16px', padding: '2rem', background: 'linear-gradient(145deg, #f0f9ff, #fff)', boxShadow: '0 4px 24px rgba(14,165,233,.07)' }}>
              <div style={{ width: '52px', height: '52px', background: '#e0f2fe', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1.25rem' }}>🏪</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e1035', margin: '0 0 0.5rem' }}>Vendor Portal</h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
                For registered suppliers and service providers. View open tenders, submit competitive quotes, and track awards.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {['Browse open procurement tenders', 'Submit & manage price quotations', 'Track tender award status', 'Secure document upload & bank details'].map(f => (
                  <li key={f} style={{ fontSize: '0.82rem', color: '#374151', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <span style={{ color: '#0ea5e9', flexShrink: 0 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Link href="/vendor/login" style={{ flex: 1, display: 'block', textAlign: 'center', padding: '0.75rem', background: '#0ea5e9', color: '#fff', borderRadius: '10px', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none' }}>
                  Vendor Sign In
                </Link>
                <Link href="/vendor/register" style={{ flex: 1, display: 'block', textAlign: 'center', padding: '0.75rem', border: '1.5px solid #0ea5e9', color: '#0ea5e9', borderRadius: '10px', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none' }}>
                  Register Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Healthcare Portfolio with real logos ───────────────────────────────── */}
      <section style={{ padding: '3.5rem 2rem', background: '#faf5ff' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '1.4rem', fontWeight: 800, color: '#1e1035', marginBottom: '0.4rem' }}>Our Healthcare Portfolio</h2>
          <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '2rem', fontSize: '0.9rem' }}>
            Procurement spans all six Magenta Investments healthcare entities.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {SUBSIDIARIES.map(({ name, desc, logo }) => (
              <div key={name} style={{ background: '#fff', border: '1.5px solid #ede9fe', borderRadius: '14px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.875rem' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logo}
                  alt={name}
                  style={{ height: '44px', width: 'auto', maxWidth: '160px', objectFit: 'contain' }}
                  onError={`this.style.display='none';this.nextElementSibling.style.display='flex'`}
                />
                <div style={{ display: 'none', width: '44px', height: '44px', background: '#7c3aed', borderRadius: '10px', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#fff', fontSize: '1.2rem' }}>🏥</span>
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, color: '#1e1035', fontSize: '0.9rem' }}>{name}</p>
                  <p style={{ margin: '0.2rem 0 0', color: '#6b7280', fontSize: '0.78rem', lineHeight: 1.5 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <footer style={{ background: '#1e1035', color: '#a78bfa', padding: '3rem 2rem 2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem', paddingBottom: '2rem', borderBottom: '1px solid rgba(167,139,250,.2)' }}>
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://magenta-investments.com/wp-content/uploads/2025/09/Logo-white.png" alt="Magenta Investments LLC" style={{ height: '36px', width: 'auto', objectFit: 'contain', marginBottom: '1rem' }} />
            <p style={{ fontSize: '0.82rem', color: '#c4b5fd', lineHeight: 1.7, margin: 0 }}>
              A UAE-based investment group at the intersection of innovation and empathy, nurturing healthcare ventures that improve lives.
            </p>
          </div>
          <div>
            <p style={{ fontWeight: 700, color: '#fff', marginBottom: '1rem', fontSize: '0.85rem' }}>Contact</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <a href="tel:+97142222500" style={{ color: '#c4b5fd', textDecoration: 'none', fontSize: '0.82rem' }}>📞 +971 4 222 2500</a>
              <a href="mailto:info@magenta-investments.com" style={{ color: '#c4b5fd', textDecoration: 'none', fontSize: '0.82rem' }}>✉️ info@magenta-investments.com</a>
              <p style={{ color: '#c4b5fd', margin: 0, fontSize: '0.82rem', lineHeight: 1.5 }}>📍 4903 Aspin Commercial Tower,<br />Sheikh Zayed Road, P.O. Box 33233,<br />Dubai, UAE</p>
            </div>
          </div>
          <div>
            <p style={{ fontWeight: 700, color: '#fff', marginBottom: '1rem', fontSize: '0.85rem' }}>Hours</p>
            <p style={{ color: '#c4b5fd', fontSize: '0.82rem', margin: 0, lineHeight: 1.8 }}>
              Monday – Saturday<br />9:00 AM – 7:00 PM<br />
              <span style={{ color: '#7c3aed' }}>Sunday: Closed</span>
            </p>
          </div>
        </div>
        <p style={{ textAlign: 'center', color: '#6d28d9', fontSize: '0.75rem', margin: '1.5rem 0 0' }}>
          © {new Date().getFullYear()} Magenta Investments LLC. All rights reserved. · Procurement Portal v2.0
        </p>
      </footer>

    </div>
  )
}
