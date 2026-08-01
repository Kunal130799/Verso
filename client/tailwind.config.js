/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: 'var(--bg)',
        surface: 'var(--surface)',
        ink: 'var(--text)',
        faint: 'var(--text-muted)',
        wire: 'var(--border)',
        accent: 'var(--accent)',
        'accent-hi': 'var(--accent-hover)',
        signature: 'var(--signature)',
      },
      fontFamily: {
        serif: ['Sora', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        reading: '68ch',
        feed: '680px',
        wide: '1080px',
      },
    },
  },
  plugins: [],
}
