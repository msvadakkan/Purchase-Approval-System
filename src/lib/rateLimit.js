// In-memory rate limiter — works for single-server Node.js deployments.
// For multi-instance deployments, replace with Redis-backed implementation.

const store = new Map()

// Purge old entries every 5 minutes to prevent memory growth
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key)
  }
}, 5 * 60 * 1000)

/**
 * @param {string}  key       - Unique key (e.g. `login:${ip}`)
 * @param {number}  max       - Max requests allowed in the window
 * @param {number}  windowMs  - Window duration in milliseconds
 * @returns {{ ok: boolean, remaining: number, resetAt: number }}
 */
export function rateLimit(key, max = 10, windowMs = 60_000) {
  const now = Date.now()
  let entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs }
  }

  entry.count++
  store.set(key, entry)

  return {
    ok:        entry.count <= max,
    remaining: Math.max(0, max - entry.count),
    resetAt:   entry.resetAt,
  }
}
