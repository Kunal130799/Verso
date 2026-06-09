# How to Build Verso with Claude Code

Read this **before** starting Phase 1. It explains how to use Claude Code so you end up with a project you actually understand — which is the whole point of a portfolio piece.

---

## What Claude Code is

Claude Code is an AI coding agent that runs in your terminal (or VS Code / JetBrains). It can read your files, write code, run commands, and fix errors — all inside your real project folder. You talk to it in plain English; it edits the actual files.

Install (you'll need Node.js 18+ installed first):

```bash
npm install -g @anthropic-ai/claude-code
```

Then, inside your project folder:

```bash
claude
```

> Versions and install steps change. If the command above doesn't work, check the official docs at `docs.claude.com` for the current install instructions.

---

## The golden rules (these matter for the portfolio)

1. **Go one phase at a time, one feature at a time.** Never say "build the whole app." You'll get a tangle you can't explain. Small steps = clean code + you understand it.
2. **Read what it writes.** After each feature, open the files and skim them. Ask Claude Code: *"Explain what this file does in plain English."* If you can't explain a piece in an interview, you don't own it yet.
3. **Commit after every working feature.** `git commit` often, with clear messages. This is also your "undo button."
4. **Keys never go in code or git.** All secrets live in `.env` files that are listed in `.gitignore`. (Details below.)
5. **When something breaks, paste the full error.** Give Claude Code the exact error text and what you were doing. Don't paraphrase.
6. **Make it confirm the plan before big changes.** Ask: *"Before you write code, tell me your plan and which files you'll change."*

---

## How to feed it these docs

Put all these `.md` files in a `/docs` folder inside your repo. Then at the start of a session you can literally tell Claude Code:

> "Read `docs/README.md` and `docs/DESIGN.md` for context. Today we're doing `docs/PHASE-1-foundation.md`. Start with step 1 only and stop after it so I can review."

Claude Code can open and read those files itself. This keeps it aligned with every decision we locked in.

---

## Handling your API keys safely

You'll collect keys from three places:

- **Supabase:** Project URL, `anon` public key (frontend), `service_role` secret key (backend only — never frontend), and the JWT secret. Found in Supabase → Project Settings → API.
- **Vercel & Render:** you don't paste keys into code — you set environment variables in their dashboards, plus you'll log in via their CLIs / GitHub connection.

Where keys go:
- **Frontend (`/client/.env`)** — only the public `anon` key + Supabase URL + your API base URL. These are safe to expose in the browser.
- **Backend (`/server/.env`)** — the `service_role` key and JWT secret. **Never** sent to the browser, never committed.
- Both `.env` files must be in `.gitignore`. Commit a `.env.example` with empty placeholders instead.

Tell Claude Code:

> "Create `.env.example` files for client and server with all needed variables as empty placeholders, and make sure real `.env` files are gitignored. I'll fill in the real values myself."

You paste the real values into the files yourself (and into Vercel/Render dashboards for production). That way your secrets never pass through chat.

---

## The SQL file workflow

In Phase 1, Claude Code will generate **`supabase_schema.sql`** based on the schema in `PHASE-1-foundation.md`. You then:

1. Open Supabase → **SQL Editor** → **New query**.
2. Paste the entire contents of `supabase_schema.sql`.
3. Click **Run**.
4. Confirm the tables appear under **Table Editor**.

If you change the data model later, ask Claude Code for a **migration** SQL file (only the changes), not a full re-run, so you don't lose data.

---

## Prompt templates

**Start of a phase:**
> "Read `docs/PHASE-2-core-mvp.md`. Summarize the goals back to me in your own words, list the features in build order, then start the first one. Stop after the first feature so I can test it."

**Building one feature:**
> "Implement [feature] following our stack in README.md and the style in DESIGN.md. Before coding, list the files you'll create or change. Keep the API logic in `/server` and UI in `/client`. Add no new libraries without telling me why."

**After it builds something:**
> "Walk me through what you just wrote, file by file, in plain English. Where are the parts I should understand for an interview?"

**Debugging:**
> "I ran [command] and got this exact error: [paste full error]. Here's what I expected to happen: [...]. Diagnose it, tell me the cause, then fix it."

**Reviewing for quality:**
> "Review the code you wrote this session for security and clarity. Are there any places a logged-in user could access another user's private posts? Any secrets leaking to the frontend?"

**Deploying:**
> "Read the deploy section of the current phase doc. Walk me through deploying the frontend to Vercel and the backend to Render step by step. Don't assume — ask me for anything you need from the dashboards."

---

## A healthy rhythm per work session

1. Tell Claude Code which phase + which step.
2. Have it state the plan and files.
3. Let it build **one** feature.
4. You test it in the browser.
5. Ask it to explain the code.
6. `git commit`.
7. Repeat.

Slower than "build everything," but you finish with a real project and real understanding. That's what gets you the interview.
