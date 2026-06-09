# Phase 4 — Polish & Portfolio

**Goal:** make Verso *look* as good as it works, then package it so it sells you. This phase is where the portfolio value is actually created. Don't skip it.

---

## 1. Design polish pass

Go screen by screen against `DESIGN.md`:
- Consistent spacing, hairline borders, the one accent used sparingly.
- Reading column width capped (~680px); never edge-to-edge text.
- Real empty states ("Nothing here yet. Write your first post →").
- Loading skeletons instead of blank flashes.
- Mobile: test every page on a narrow screen. The feed, editor, and post page must feel good on a phone.

Prompt:
> "Do a design-polish pass across all pages against DESIGN.md: spacing, type scale, accent usage, empty states, loading skeletons, and mobile responsiveness. Show me before/after for the home feed and post page."

---

## 2. Dark mode toggle

- Implement the light/dark toggle from `DESIGN.md` (flip `data-theme`/`dark` on `<html>`, persist to localStorage, default to system preference).
- Check every screen and the markdown-rendered content in both modes.

Prompt:
> "Implement the dark/light toggle per DESIGN.md, persisted and defaulting to system preference. Verify contrast on all pages including rendered markdown."

---

## 3. The legal pages (real content)

Replace the Phase 2 placeholders with the real text from `LEGAL_CONTENT.md`:
- `/privacy` — Privacy Policy
- `/terms` — Terms of Service
- `/guidelines` — Content Guidelines
- Link all three in the footer; Terms + Privacy from the consent gate.

Prompt:
> "Build /privacy, /terms, and /guidelines pages using the text in docs/LEGAL_CONTENT.md, styled simply and readably. Link them in the footer and from the consent gate. Insert today's date and the contact email I provide as the placeholders."

---

## 4. SEO & meta

- Per-post `<title>`, meta description (from excerpt), and Open Graph tags (title, description, cover image) so shared links look good — including your LinkedIn link.
- A favicon from the Verso book mark.

Prompt:
> "Add per-page titles, meta descriptions, and Open Graph/Twitter card tags (use the post cover as the OG image). Generate a favicon from the Verso mark."

---

## 5. The GitHub README (recruiters read this first)

Write a real README at the repo root. Include:
- **Verso** + tagline + one-line description.
- **Live demo** link + **screenshots** (light and dark, the feed + a post + the editor).
- **Tech stack** with the why (React/Vercel, Node/Render, Supabase).
- The **architecture diagram** (the login→JWT→API→DB flow from the master README — turn it into a simple image or keep the ASCII version).
- **Features** list.
- **Local setup** instructions (clone, env vars, run).
- A short **"What I learned / decisions I made"** section — the keep-alive trick, why a separate API, auth verification, private-post 404 handling. This is what makes you look senior.

Prompt:
> "Write a portfolio-grade README.md at the repo root with: live link, screenshots section, tech stack with rationale, the architecture diagram, features, local setup, and a 'key decisions' section covering the keep-alive ping, the separate Node API, JWT verification, and hiding private posts with 404. Professional but not bloated."

---

## 6. Demo content

Seed a handful of well-written public posts (with covers and tags) under your own account so a visitor lands on a full, alive-looking feed — not an empty page. Quality over quantity: 4–6 good posts.

---

## 7. Final deploy & keep-alive verification

- Final redeploy of client (Vercel) + server (Render).
- Confirm the UptimeRobot/cron-job.org monitor on `/health` is green and pinging every ~10 min.
- Test: open the live link in a private window after a quiet period — it should load fast (no cold start) and Google login should work.

---

## 8. The LinkedIn post

Tell a story, don't list features. A structure that works:

> Just shipped **Verso** — a minimal blogging platform where you can write in Markdown and publish public or keep private. 🔗 [live link] · [GitHub]
>
> Why I built it: [one honest line — e.g. wanted a real full-stack project, not a tutorial].
>
> Stack: React + Node + Supabase, deployed free on Vercel + Render.
>
> The interesting bits: a separate API that verifies Supabase auth tokens, private posts that 404 instead of 403 so they stay invisible, and a single health-check ping that keeps both free hosts awake so the demo never cold-starts.
>
> What I learned: [one genuine line].
>
> Feedback welcome 👇

Attach 2–3 clean screenshots (the feed in dark mode reads especially well). Post mid-week, mid-morning.

Prompt (for a draft):
> "Draft 3 versions of a LinkedIn post announcing Verso, based on Phase 4 section 8 — one understated, one with more personality, one focused on the technical decisions. Keep each short."

---

## Definition of Done ✅

- [ ] Polished, consistent UI on desktop and mobile
- [ ] Dark/light toggle works everywhere
- [ ] Real /privacy, /terms, /guidelines pages, linked in footer
- [ ] SEO + Open Graph tags + favicon
- [ ] Portfolio-grade repo README with screenshots, diagram, and key-decisions section
- [ ] 4–6 quality demo posts seeded
- [ ] Live link loads fast (keep-alive verified green)
- [ ] LinkedIn post drafted and ready

When this is checked, Verso is done and ready to show the world. 🎉
