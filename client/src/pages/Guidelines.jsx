import { useEffect } from 'react'

export default function Guidelines() {
  useEffect(() => { document.title = 'Content Guidelines — Verso' }, [])

  return (
    <div className="max-w-reading mx-auto px-6 py-12">
      <div className="prose max-w-none">
        <h1>Content Guidelines</h1>
        <p>Verso is a place to write and share. To keep it usable for everyone, don't post:</p>

        <ul>
          <li><strong>Illegal content</strong> or anything that promotes illegal activity.</li>
          <li><strong>Hate or harassment</strong> — attacks on people based on who they are, threats, or targeted abuse.</li>
          <li><strong>Sexual content involving minors</strong> — zero tolerance; this is reported where required by law.</li>
          <li><strong>Violence or harm</strong> — content that incites or glorifies serious harm.</li>
          <li><strong>Spam or scams</strong> — repetitive junk, misleading schemes, or deceptive links.</li>
          <li><strong>Malware or security abuse</strong> — code or links intended to harm or exploit.</li>
          <li><strong>Infringement</strong> — content you don't have the right to post, including others' copyrighted work.</li>
          <li><strong>Private information</strong> — others' personal data shared without consent.</li>
        </ul>

        <p>We may remove content that breaks these rules and may suspend repeat offenders.</p>
        <p>If you see something that violates these guidelines, contact <a href="mailto:kunalparmar130799@gmail.com">kunalparmar130799@gmail.com</a>.</p>
      </div>
    </div>
  )
}
