import { useEffect } from 'react'

export default function Privacy() {
  useEffect(() => { document.title = 'Privacy Policy — Verso' }, [])

  return (
    <div className="max-w-reading mx-auto px-6 py-12">
      <div className="prose max-w-none">
        <h1>Privacy Policy</h1>
        <p><strong>Effective date:</strong> June 2025</p>
        <p>This Privacy Policy explains what Verso ("we", "us") collects and how we use it.</p>

        <h2>What we collect</h2>
        <ul>
          <li><strong>Account info from Google sign-in:</strong> your name, email address, and profile photo. We use Google solely to sign you in; we don't get your Google password.</li>
          <li><strong>Profile info you provide:</strong> your username and bio.</li>
          <li><strong>Content you create:</strong> the posts you write, their visibility setting, tags, and any cover images you upload.</li>
          <li><strong>Basic usage data:</strong> for example, public post view counts.</li>
        </ul>

        <h2>How we use it</h2>
        <ul>
          <li>To create and run your account.</li>
          <li>To display your public posts and public profile to others.</li>
          <li>To keep private and draft posts visible only to you.</li>
          <li>To operate, maintain, and improve the service.</li>
        </ul>
        <p>We do <strong>not</strong> sell your personal information.</p>

        <h2>Who can see your content</h2>
        <ul>
          <li><strong>Public</strong> posts and your public profile are visible to anyone.</li>
          <li><strong>Private</strong> and <strong>draft</strong> posts are visible only to you.</li>
        </ul>

        <h2>Where your data lives</h2>
        <p>Verso uses Supabase (database, authentication, file storage) and is hosted on Vercel and Render. Your data is stored on their infrastructure on our behalf.</p>

        <h2>Your choices</h2>
        <ul>
          <li>Edit your profile and posts anytime.</li>
          <li>Change any post between public, private, and draft.</li>
          <li><strong>Delete your account</strong> at any time from Settings. This permanently removes your profile and posts.</li>
        </ul>

        <h2>Data retention</h2>
        <p>We keep your data until you delete it (or your account). Deleting your account removes your profile and posts.</p>

        <h2>Children</h2>
        <p>Verso is not directed to children under 13 and we don't knowingly collect their data.</p>

        <h2>Changes</h2>
        <p>We may update this policy; we'll change the effective date above when we do.</p>

        <p>Questions about privacy: <a href="mailto:kunalparmar130799@gmail.com">kunalparmar130799@gmail.com</a></p>
      </div>
    </div>
  )
}
