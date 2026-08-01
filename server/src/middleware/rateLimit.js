import rateLimit, { ipKeyGenerator } from 'express-rate-limit'

// ponytail: in-memory store — resets on redeploy/restart and doesn't share
// state across instances. Fine for Render's single free-tier instance;
// swap to a Redis store (rate-limit-redis) if this ever runs on more than one.

// Baseline for all API traffic — guards against scraping/DoS, not meant to
// bother real usage.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
})

// Content-creating actions (new posts, uploads) — keyed by user when
// authenticated so one account can't be spammed around by rotating IPs,
// falling back to IP for safety. Must run after requireAuth so req.user
// is populated.
export const writeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: req => req.user?.id || ipKeyGenerator(req.ip),
})

// Anonymous view-count increments — the frontend already dedupes per
// session, but that's trivially bypassed, so this is the real guard against
// inflating a post's view count.
export const viewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
})
