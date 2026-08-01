import remarkGfm from 'remark-gfm'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeHighlight from 'rehype-highlight'
import CodeBlock from '../components/CodeBlock'

// rehype-highlight tags tokens with classes like `hljs-keyword` on <span> and
// `hljs language-js` on <code> — the default sanitize schema only allows
// `language-*` on <code> and nothing on <span>, so highlighting gets stripped
// without this.
const schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: ['className'],
    span: ['className'],
  },
}

export const markdownRemarkPlugins = [remarkGfm]
export const markdownRehypePlugins = [rehypeHighlight, [rehypeSanitize, schema]]
export const markdownComponents = { pre: CodeBlock }
