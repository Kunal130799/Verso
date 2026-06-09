import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function Terms() {
  useEffect(() => { document.title = 'Terms of Service — Verso' }, [])

  return (
    <div className="max-w-reading mx-auto px-6 py-12">
      <div className="prose max-w-none">
        <h1>Terms of Service</h1>
        <p><strong>Effective date:</strong> June 2025</p>
        <p>By using Verso, you agree to these terms.</p>

        <h2>1. Your account</h2>
        <p>You sign in with Google. You're responsible for activity on your account. You must provide accurate information and not impersonate others.</p>

        <h2>2. Eligibility</h2>
        <p>You must be at least 13 years old to use Verso.</p>

        <h2>3. Your content</h2>
        <p><strong>You own what you write.</strong> You keep all rights to your posts. By posting <strong>public</strong> content, you grant Verso a limited license to store and display it on the platform so others can read it. This license ends when you delete the content or your account. You're responsible for your content and must have the right to post it.</p>

        <h2>4. Acceptable use</h2>
        <p>You agree not to post content that is illegal, infringes others' rights, is hateful or harassing, is spam or malware, or otherwise violates our <Link to="/guidelines">Content Guidelines</Link>. We may remove content or suspend accounts that violate these terms.</p>

        <h2>5. Availability</h2>
        <p>Verso is provided "as is." It runs on free-tier infrastructure and may be unavailable, slow, or change at any time. We don't guarantee uptime or that data is never lost — keep your own copies of anything important.</p>

        <h2>6. Termination</h2>
        <p>You can delete your account anytime. We may suspend or terminate accounts that violate these terms.</p>

        <h2>7. Liability</h2>
        <p>To the extent allowed by law, Verso is not liable for damages arising from your use of the service.</p>

        <h2>8. Changes</h2>
        <p>We may update these terms; continued use after changes means you accept them.</p>

        <p>Questions: <a href="mailto:kunalparmar130799@gmail.com">kunalparmar130799@gmail.com</a></p>
      </div>
    </div>
  )
}
