import nodemailer from 'nodemailer'

function getTransporter() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST || 'smtp.office365.com',
    port:   parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: { ciphers: 'SSLv3', rejectUnauthorized: false },
  })
}

const FROM = `"Magenta Investments LLC" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`
const BRAND_COLOR = '#7c3aed'

function baseTemplate(title, body) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
  <style>body{margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif}
  .wrap{max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.08)}
  .hdr{background:linear-gradient(135deg,${BRAND_COLOR},#9333ea);padding:28px 32px;text-align:center}
  .hdr h1{color:#fff;font-size:20px;margin:0;font-weight:700}
  .hdr p{color:rgba(255,255,255,.8);font-size:13px;margin:4px 0 0}
  .body{padding:28px 32px}.body h2{font-size:16px;color:#1e293b;margin:0 0 8px}
  .body p{font-size:14px;color:#475569;line-height:1.6;margin:0 0 16px}
  .amount{font-size:24px;font-weight:800;color:${BRAND_COLOR};margin:0}
  .meta{background:#f8fafc;border-radius:8px;padding:14px 18px;margin:16px 0;font-size:13px;color:#64748b}
  .meta td{padding:4px 0;vertical-align:top}.meta td:first-child{font-weight:600;color:#334155;width:40%;padding-right:12px}
  .status-approved{color:#065f46;background:#d1fae5;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;display:inline-block}
  .status-rejected{color:#991b1b;background:#fee2e2;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;display:inline-block}
  .status-pending{color:#92400e;background:#fef3c7;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;display:inline-block}
  .btn{display:inline-block;background:${BRAND_COLOR};color:#fff;padding:11px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;margin:8px 0}
  .footer{padding:16px 32px;border-top:1px solid #f1f5f9;text-align:center;font-size:12px;color:#94a3b8}
  </style></head><body>
  <div class="wrap">
    <div class="hdr"><h1>Magenta Investments LLC</h1><p>Purchase Approval System</p></div>
    <div class="body">${body}</div>
    <div class="footer">This is an automated message from the Magenta Investments procurement system.<br/>Please do not reply directly to this email.</div>
  </div></body></html>`
}

function fmtAmount(n) {
  return `AED ${parseFloat(n || 0).toLocaleString('en-AE', { minimumFractionDigits: 2 })}`
}

// ── Email Templates ───────────────────────────────────────────────────────────

function requestSubmittedEmail(req, requesterName) {
  const body = `
    <h2>Request Submitted</h2>
    <p>Hi ${requesterName},</p>
    <p>Your purchase request has been submitted successfully and is awaiting approval.</p>
    <table class="meta"><tbody>
      <tr><td>Request Title</td><td><strong>${req.title}</strong></td></tr>
      <tr><td>Amount</td><td><p class="amount">${fmtAmount(req.amount)}</p></td></tr>
      <tr><td>Category</td><td>${req.category || '—'}</td></tr>
      <tr><td>Status</td><td><span class="status-pending">Pending Approval</span></td></tr>
    </tbody></table>
    <p>You will be notified once a decision has been made.</p>`
  return { subject: `Request Submitted: ${req.title}`, html: baseTemplate('Request Submitted', body) }
}

function requestApprovedEmail(req, requesterName, approverName) {
  const body = `
    <h2>Request Approved</h2>
    <p>Hi ${requesterName},</p>
    <p>Great news! Your purchase request has been <strong>approved</strong>.</p>
    <table class="meta"><tbody>
      <tr><td>Request Title</td><td><strong>${req.title}</strong></td></tr>
      <tr><td>Amount</td><td><p class="amount">${fmtAmount(req.amount)}</p></td></tr>
      <tr><td>Approved By</td><td>${approverName}</td></tr>
      <tr><td>Status</td><td><span class="status-approved">Approved</span></td></tr>
    </tbody></table>`
  return { subject: `Approved: ${req.title}`, html: baseTemplate('Request Approved', body) }
}

function requestRejectedEmail(req, requesterName, approverName, comments) {
  const body = `
    <h2>Request Rejected</h2>
    <p>Hi ${requesterName},</p>
    <p>Unfortunately, your purchase request has been <strong>rejected</strong>.</p>
    <table class="meta"><tbody>
      <tr><td>Request Title</td><td><strong>${req.title}</strong></td></tr>
      <tr><td>Amount</td><td>${fmtAmount(req.amount)}</td></tr>
      <tr><td>Rejected By</td><td>${approverName}</td></tr>
      <tr><td>Status</td><td><span class="status-rejected">Rejected</span></td></tr>
      ${comments ? `<tr><td>Reason</td><td>${comments}</td></tr>` : ''}
    </tbody></table>
    <p>Please contact your manager for more information or resubmit a revised request.</p>`
  return { subject: `Rejected: ${req.title}`, html: baseTemplate('Request Rejected', body) }
}

function approvalPendingEmail(req, approverName, requesterName) {
  const body = `
    <h2>Approval Required</h2>
    <p>Hi ${approverName},</p>
    <p>A new purchase request requires your approval.</p>
    <table class="meta"><tbody>
      <tr><td>Request Title</td><td><strong>${req.title}</strong></td></tr>
      <tr><td>Requested By</td><td>${requesterName}</td></tr>
      <tr><td>Amount</td><td><p class="amount">${fmtAmount(req.amount)}</p></td></tr>
      <tr><td>Category</td><td>${req.category || '—'}</td></tr>
      <tr><td>Status</td><td><span class="status-pending">Awaiting Your Approval</span></td></tr>
    </tbody></table>
    <p>Please log in to the system to review and take action.</p>`
  return { subject: `Action Required: Approve "${req.title}"`, html: baseTemplate('Approval Required', body) }
}

// ── Send helpers ──────────────────────────────────────────────────────────────

async function send(to, subject, html) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return  // skip if not configured
  try {
    await getTransporter().sendMail({ from: FROM, to, subject, html })
  } catch (err) {
    console.error('[email] Failed to send to', to, '—', err.message)
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function notifyRequestCreated(req, requesterEmail, requesterName, approvers) {
  const { subject, html } = requestSubmittedEmail(req, requesterName)
  await send(requesterEmail, subject, html)

  for (const approver of approvers) {
    if (!approver.email) continue
    const { subject: s, html: h } = approvalPendingEmail(req, approver.name, requesterName)
    await send(approver.email, s, h)
  }
}

export async function notifyRequestApproved(req, requesterEmail, requesterName, approverName) {
  const { subject, html } = requestApprovedEmail(req, requesterName, approverName)
  await send(requesterEmail, subject, html)
}

export async function notifyRequestRejected(req, requesterEmail, requesterName, approverName, comments) {
  const { subject, html } = requestRejectedEmail(req, requesterName, approverName, comments)
  await send(requesterEmail, subject, html)
}
