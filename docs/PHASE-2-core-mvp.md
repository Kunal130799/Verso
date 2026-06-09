# Phase 2 — Core MVP

**Goal:** the real product. Users can write posts, choose who sees them, and the world can read public ones. This is the minimum shippable version of Verso. Deploy it when done.

Build features in this order, one at a time. Test each in the browser before the next.

---

## 1. Consent at signup (do this first)

New users must agree to the Terms + Privacy Policy before an account is usable.

- After first Google login, if `profiles.terms_accepted_at` is null, show a one-time screen: a checkbox — *"I agree to the Terms of Service and Privacy Policy"* (links to those pages) — and a "Continue" button that's disabled until checked.
- On continue, the backend sets `terms_accepted_at = now()`.
- The actual page text comes from `LEGAL_CONTENT.md` (built as real pages in Phase 4, but stub the routes `/terms` and `/privacy` now so the links work).

Prompt:
> "Add a consent gate: after login, if the user hasn't accepted terms, show a checkbox + Continue screen. On accept, call a backend route that sets terms_accepted_at. Block app use until accepted. Add placeholder /terms and /privacy routes."

---

## 2. Write / create a post

- A "Write" button (only when logged in) opens a new post form: **title** + **content** (plain textarea for now — the fancy markdown editor is Phase 3) + a **status** selector: Draft / Private / Public.
- Backend `POST /api/posts`: creates the post for the logged-in author. Generates a URL **slug** from the title (lowercase, hyphenated, deduped per author). Computes **reading_time_minutes** from word count (~200 words/min). Sets `published_at` when status becomes public.

Prompt:
> "Implement create-post. Backend route `POST /api/posts` (auth required) that saves title, content, status; auto-generates a unique slug per author and a reading-time estimate. Frontend: a Write page with title, content textarea, and a Draft/Private/Public selector. Only the author_id from the verified token is trusted — never from the request body."

---

## 3. Edit / update + delete a post

- `PUT /api/posts/:id` — only the author can edit (enforce via the verified token, not the body).
- `DELETE /api/posts/:id` — only the author can delete. Confirm dialog: *"Delete this post? This can't be undone."*
- An author "My posts" page listing their own posts (all statuses) with edit/delete and a status chip.

Prompt:
> "Add update + delete routes, authorized so only the author can modify their post. Add a 'My Posts' page showing the logged-in user's posts (all statuses) with status chips, edit, and delete (with confirm)."

---

## 4. Public feed (home page)

- `GET /api/posts` — returns only **public** posts, newest first, paginated. Includes author name/avatar, title, excerpt, reading time, date, cover (null for now).
- Home page renders the feed as cards per `DESIGN.md`. No login required to view.

Prompt:
> "Build the public home feed: backend returns only public posts (paginated, newest first) with author info; frontend renders them as editorial cards following DESIGN.md. Viewable logged-out."

---

## 5. Single post page

- Route `/@:username/:slug` (or `/p/:id` to start — your call, but the username route is nicer and sets up Phase 3 profiles).
- `GET /api/posts/:idOrSlug`:
  - **Public** post → anyone can read.
  - **Private/Draft** → only the author (verified token) gets it; everyone else gets 404 (not 403 — don't reveal it exists).
- Render the content. (Markdown rendering comes in Phase 3; for now plain text/line breaks is fine.)

Prompt:
> "Add a single-post page. Backend returns a post by slug; public posts are open, but private/draft posts return 404 to anyone who isn't the author. Frontend renders title, author, date, reading time, and body."

---

## 6. Account & post deletion (data rights)

- A Settings page with **Delete my account** → confirm → backend deletes the user's posts and profile and the Supabase auth user. (Cascade deletes handle posts/tags via the schema.)

Prompt:
> "Add a Settings page with Delete Account. On confirm, the backend deletes the user's data and their auth account. Use a clear two-step confirm."

---

## Security checklist for this phase

Ask Claude Code to self-review:
> "Review this phase: can any logged-in user read or edit another user's private/draft posts? Is author_id ever trusted from the request body instead of the verified token? Are private posts hidden with 404 rather than 403?"

---

## Definition of Done ✅

- [ ] Consent gate blocks app use until terms accepted; `terms_accepted_at` set
- [ ] Create / edit / delete posts — only by the author
- [ ] Draft / Private / Public statuses behave correctly
- [ ] Public feed shows only public posts, works logged-out
- [ ] Single post page: public open, private/draft → 404 for non-authors
- [ ] "My Posts" page with status chips
- [ ] Delete account works
- [ ] Redeployed; live site has all of the above
- [ ] Security self-review passed

This is a usable product. Ship it, then move to Phase 3 to make it shine.
