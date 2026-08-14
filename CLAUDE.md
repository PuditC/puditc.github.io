# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What ships

The live portfolio is **`site/` — plain HTML, CSS and JS. No build step, no framework, no
dependencies.** Open `site/index.html` in a browser and you are looking at production.

Switched from Create React App to static on **2026-08-14** (owner's call). Reasons: a portfolio
is text and images, so server-rendered HTML indexes far better than a CRA bundle that paints
nothing until JS runs; and it drops the ~230KB three.js chunk plus the whole build pipeline.

The old React app still sits in `src/` + `public/` but **is no longer deployed**. It is kept only
until the owner confirms deletion — do not add features to it.

## Commands

```bash
npm run check      # smoke test: every local link in site/ resolves (scripts/check-links.mjs)
npm run deploy     # manual publish of site/ to GitHub Pages via gh-pages
```

There is no dev server. To preview, serve the folder with anything static, e.g.
`python -m http.server 8080 --directory site`, then open `http://127.0.0.1:8080/`.

## Structure

```
site/
  index.html             Work — poster hero, 8 project plates, statement band, index table
  about.html             Timeline, portrait panel
  signals.html           Live GitHub activity (client-side fetch of the public API)
  contact.html           Contact, with click-to-reveal email
  case-prompt-plus.html  Case study — Prompt Plus Accounting
  poster.css             The whole design system (see below)
  poster.js              The whole behaviour layer (see below)
  assets/                Screenshots, portrait, project art
  .nojekyll              Keep GitHub Pages from running Jekyll over the files
scripts/check-links.mjs  CI smoke test
```

Page filenames are the URLs. Renaming a page means updating every link to it — `npm run check`
is what catches a miss.

### The design system — `poster.css`

Poster grid: Helvetica display type over a fixed 12-column rule overlay, Space Mono for every
label, monochrome paper/ink. Light is the default; `[data-theme=dark]` swaps six custom
properties and nothing else, so **never hard-code a colour — use `var(--ink)`, `var(--paper)`,
`var(--mute)`, `var(--faint)`, `var(--rule)`, `var(--tint)`, `var(--graph)`.**

Shared classes worth knowing before writing new markup: `.wrap` (page gutter), `.g12` (12-col
grid), `.top` (nav bar), `.pt` (poster type, `.out` for the outlined variant), `.blk` (inverted
strip), `.sh` (section head), `.tbl` (index row), `.band` (inverted statement), `.end` +
`footer`, `.mq` (marquee), `.rv3` (scroll reveal), `.ph-media` (hatched image placeholder).

Page-specific CSS lives in a `<style>` block in that page's `<head>` — that is deliberate, so a
page can be reasoned about on its own. Only promote a rule into `poster.css` when a second page
needs it.

### The behaviour layer — `poster.js`

One file, one `DOMContentLoaded` handler, all opt-in through data attributes:

| Attribute | Effect |
|-----------|--------|
| `data-tgl` | Element becomes the light/dark toggle. Choice persists in `localStorage` under `pf-poster-theme` |
| `data-sc` | Text scrambles on hover |
| `data-mq` | Container becomes an auto-scrolling, drag-nudgeable marquee (its child is duplicated for the seam) |
| `data-mail` + `data-dom` | Click reveals `mail@dom`, second click copies. Assembled at runtime so the address is not in the HTML, and it never fires a `mailto:` |
| `.rv3` | Fades/rises in via IntersectionObserver, with a timeout fallback so content can never stay invisible |

Theme is also applied by a tiny inline script in each `<head>`, before paint — that is what
stops a light flash on a dark-theme reload. Keep it when adding a page.

### The work plates — `site/index.html`

Eight `.pl` cards in a 12-column grid: `.pl` spans 4, `.pl.w6` spans 6. **Every row must add up
to 12** or the grid's rule-coloured background shows through as a grey block. Current tiling is
`6+6 / 6+6 / 4+4+4 / 6+6`. Adding or removing a card means re-tiling the whole set.

Screenshots are greyscaled by CSS and only regain colour on hover — so capture them at normal
colour and let the stylesheet do it.

## Deployment

`.github/workflows/deploy.yml` publishes `./site` to the `gh-pages` branch on every push to
`main` — no install, no build. `.github/workflows/ci.yml` runs the link check and a gitleaks
secret scan.

Live at **https://puditc.github.io/**. The repo was renamed `oampudit.github.io` →
`puditc.github.io` on 2026-08-14 so it matches the `PuditC` handle — a GitHub user-site only
serves at the root when the two match. The local folder still carries the old name; that is
cosmetic and affects nothing.

## Conventions

- The résumé PDF is deliberately **not** published. It lives in `.private/` (gitignored) and
  there is no download link anywhere on the site — the owner hands it out directly.
- Project cards state what is actually true today. If a project's status changes, the card and
  `site/signals.html`'s band both need updating.
