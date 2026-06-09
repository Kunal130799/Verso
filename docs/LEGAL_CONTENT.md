# Verso — Legal & Consent Content

Ready-to-use copy for the Privacy Policy, Terms of Service, Content Guidelines, and the signup consent. Drop these into the pages built in Phase 4.

> **Heads up — not legal advice.** I'm not a lawyer, and these are practical starter templates for a portfolio/side project, written in plain language. They cover the basics honestly. If Verso ever takes real paying users or operates somewhere with strict rules (e.g. GDPR/CCPA enforcement matters to you), have a lawyer review them. Fill in every `[bracketed]` placeholder before publishing.

Placeholders to replace everywhere: `[CONTACT_EMAIL]`, `[EFFECTIVE_DATE]`, `[YOUR_NAME_OR_ENTITY]`, `[COUNTRY/STATE]`.

---

## Privacy Policy

**Effective date:** [EFFECTIVE_DATE]

This Privacy Policy explains what Verso ("we", "us") collects and how we use it.

**What we collect**
- **Account info from Google sign-in:** your name, email address, and profile photo. We use Google solely to sign you in; we don't get your Google password.
- **Profile info you provide:** your username and bio.
- **Content you create:** the posts you write, their visibility setting, tags, and any cover images you upload.
- **Basic usage data:** for example, public post view counts.

**How we use it**
- To create and run your account.
- To display your public posts and public profile to others.
- To keep private and draft posts visible only to you.
- To operate, maintain, and improve the service.

We do **not** sell your personal information.

**Who can see your content**
- **Public** posts and your public profile are visible to anyone.
- **Private** and **draft** posts are visible only to you.

**Where your data lives**
Verso uses Supabase (database, authentication, file storage) and is hosted on Vercel and Render. Your data is stored on their infrastructure on our behalf.

**Your choices**
- Edit your profile and posts anytime.
- Change any post between public, private, and draft.
- **Delete your account** at any time from Settings. This permanently removes your profile and posts.

**Data retention**
We keep your data until you delete it (or your account). Deleting your account removes your profile and posts.

**Children**
Verso is not directed to children under [13/16 — pick per your region] and we don't knowingly collect their data.

**Changes**
We may update this policy; we'll change the effective date above when we do.

**Contact**
Questions about privacy: [CONTACT_EMAIL].

---

## Terms of Service

**Effective date:** [EFFECTIVE_DATE]

By using Verso, you agree to these terms.

**1. Your account**
You sign in with Google. You're responsible for activity on your account. You must provide accurate information and not impersonate others.

**2. Eligibility**
You must be at least [13/16/18 — pick per your region] years old to use Verso.

**3. Your content**
- **You own what you write.** You keep all rights to your posts.
- By posting **public** content, you grant Verso a limited license to store and display it on the platform so others can read it. This license ends when you delete the content or your account.
- You're responsible for your content and must have the right to post it.

**4. Acceptable use**
You agree not to post content that is illegal, infringes others' rights, is hateful or harassing, is spam or malware, or otherwise violates our Content Guidelines (linked separately). We may remove content or suspend accounts that violate these terms.

**5. Availability**
Verso is provided "as is." It runs on free-tier infrastructure and may be unavailable, slow, or change at any time. We don't guarantee uptime or that data is never lost — keep your own copies of anything important.

**6. Termination**
You can delete your account anytime. We may suspend or terminate accounts that violate these terms.

**7. Liability**
To the extent allowed by law, Verso and [YOUR_NAME_OR_ENTITY] are not liable for damages arising from your use of the service.

**8. Governing law**
These terms are governed by the laws of [COUNTRY/STATE].

**9. Changes**
We may update these terms; continued use after changes means you accept them.

**Contact:** [CONTACT_EMAIL].

---

## Content Guidelines

Verso is a place to write and share. To keep it usable for everyone, don't post:

- **Illegal content** or anything that promotes illegal activity.
- **Hate or harassment** — attacks on people based on who they are, threats, or targeted abuse.
- **Sexual content involving minors** — zero tolerance; this is reported where required by law.
- **Violence or harm** — content that incites or glorifies serious harm.
- **Spam or scams** — repetitive junk, misleading schemes, or deceptive links.
- **Malware or security abuse** — code or links intended to harm or exploit.
- **Infringement** — content you don't have the right to post, including others' copyrighted work.
- **Private information** — others' personal data shared without consent.

We may remove content that breaks these rules and may suspend repeat offenders. If you see something that violates these guidelines, contact [CONTACT_EMAIL].

---

## Signup consent (the checkbox copy)

Shown on the one-time consent gate after first sign-in. The Continue button stays disabled until the box is checked.

> ☐ I agree to Verso's **[Terms of Service](/terms)** and **[Privacy Policy](/privacy)**, and I'll follow the **[Content Guidelines](/guidelines)**.

Button: **Continue**

On accept, the backend records the timestamp in `profiles.terms_accepted_at`.

---

## Footer links

Add to the site footer on every page:

`© [year] Verso · Privacy · Terms · Guidelines`
