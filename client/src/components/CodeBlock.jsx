import { useRef, useState } from 'react'

export default function CodeBlock({ children, ...props }) {
  const preRef = useRef(null)
  const [copied, setCopied] = useState(false)

  const codeEl = Array.isArray(children) ? children[0] : children
  const className = codeEl?.props?.className || ''
  const lang = /language-(\w+)/.exec(className)?.[1]

  const handleCopy = async () => {
    const text = preRef.current?.innerText || ''
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard API unavailable — nothing to fall back to
    }
  }

  return (
    <div className="code-block">
      <div className="code-block-bar">
        <span>{lang || 'text'}</span>
        <button type="button" onClick={handleCopy}>{copied ? 'Copied' : 'Copy'}</button>
      </div>
      <pre ref={preRef} {...props}>{children}</pre>
    </div>
  )
}
