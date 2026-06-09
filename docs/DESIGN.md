# Verso — Design System

The whole point of the editorial style is restraint. White space, great type, almost no color except one ink accent. If a screen looks "busy," it's wrong.

---

## Logo

- File: `verso-logo.svg` (horizontal lockup: open-book mark + serif wordmark).
- The mark is an open book; the **left page (the verso)** is filled with the ink accent — a quiet nod to the name.
- Use the full lockup in the header. For the favicon / mobile, use just the book mark.
- Minimum clear space around the logo = the height of the "V".
- Never stretch, recolor (except mark→white for dark mode), or add effects.

---

## Color tokens

Define these as CSS variables and Tailwind theme colors. Two modes.

### Light (default)
| Token | Hex | Use |
|---|---|---|
| `--bg` | `#FAF9F7` | page background (warm paper) |
| `--surface` | `#FFFFFF` | cards, inputs |
| `--text` | `#1A1A1A` | body text |
| `--text-muted` | `#6B6B6B` | meta, captions |
| `--border` | `#E6E3DD` | hairlines, dividers |
| `--accent` | `#1F4E8C` | links, primary buttons |
| `--accent-hover` | `#173C6B` | hover state |

### Dark
| Token | Hex | Use |
|---|---|---|
| `--bg` | `#15140F` | page background (warm near-black) |
| `--surface` | `#1E1C17` | cards, inputs |
| `--text` | `#ECEAE3` | body text |
| `--text-muted` | `#9A958A` | meta, captions |
| `--border` | `#2E2B25` | hairlines, dividers |
| `--accent` | `#7FB0EE` | links, primary buttons (lighter for contrast) |
| `--accent-hover` | `#A6C8F4` | hover state |

The toggle flips a `data-theme` attribute (or a `dark` class) on `<html>`. Persist the choice in `localStorage`, default to the user's system preference (`prefers-color-scheme`).

---

## Typography

Load from Google Fonts: **Newsreader** and **Inter**.

- **Reading (post body, post titles, the home feed headlines):** Newsreader, serif. This is what makes it feel like a publication.
- **UI (buttons, nav, labels, forms, profile chrome):** Inter, sans-serif.

Scale (post reading view):
- Body: `18–19px`, line-height `1.7`, max line length ~`68ch` (never full-width — readability).
- Post title (H1): Newsreader, ~`40px`, weight 500.
- Section headings inside posts (H2/H3): Newsreader, 600.

UI scale: base `15–16px` Inter. Buttons `14–15px`, medium weight.

---

## Layout & components

- **Container:** content column maxes out around `680px` for reading, `1080px` for feed/grids. Generous margins.
- **Buttons:** primary = solid accent, white text, ~`8px` radius. Secondary = text/ghost with a hairline border. No gradients, no shadows-heavy look. Subtle.
- **Cards (feed):** cover image (optional) on top, serif title, one-line muted excerpt, then a meta row: author avatar + name · reading time · date. Hairline divider between cards or a soft `--surface` card — pick one and stay consistent.
- **Inputs:** `--surface` bg, hairline border, accent border on focus. Comfortable padding.
- **Markdown editor (Phase 3):** split view — textarea left, live rendered preview right; on mobile, a tab toggle between "Write" and "Preview."
- **Empty states:** a short serif line + a single action. e.g. "Nothing here yet. Write your first post →"
- **Status chips:** small pill — `Draft` (muted), `Private` (muted + lock icon), `Public` (accent). Quiet, not loud.

---

## Tone of voice (microcopy)

Calm, plain, a little literary — matching the name. Examples:
- Sign-in: "Sign in to write." 
- Publish confirm: "Publish to the world?"
- Make private: "Only you can see this."
- Delete: "Delete this post? This can't be undone."

---

## Motion

Minimal. `150–200ms` ease on hover/focus and theme transitions. No bounces, no parallax. The reading experience should feel still.
