# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # Install dependencies
npm start          # Start dev server at localhost:3000
npm run build      # Production build → ./build/
npm test           # Run tests (watch mode)
npm run deploy     # Manual deploy to GitHub Pages (runs build first)
```

## Architecture

This is a **Create React App** portfolio site using React 18. It does **not** use React Router — navigation is handled by a single `currentSection` state in `App.js` that conditionally renders one section at a time.

### Navigation pattern

`App.js` holds `currentSection` state and passes a `navigate` callback down to `Navbar` and `Home`. Components trigger section switches by calling `navigate('skills')` etc. The callback also scrolls to top on change.

Adding a new section requires:
1. Adding a case in `App.js`'s `renderSection()` switch
2. Adding an entry to `navItems` in `Navbar.js`
3. If the section should also be reachable from the terminal, add it to `SECTIONS` in `src/components/Terminal/Terminal.js`

### Keyboard UX

App-level `keydown` listener in `App.js`:
- `` ` `` (backtick) or `Ctrl/Cmd + K` → toggle terminal overlay
- `Esc` → close terminal

### Key components

| Component | Purpose |
|-----------|---------|
| `src/App.js` | Root — owns `currentSection` + `termOpen`, registers global hotkeys, renders `LiveGithub` below Home |
| `src/components/Navbar.js` | Fixed navbar; includes `github` section |
| `src/components/Home/Home.js` | Clean hero (lazy-loads `Hero3D`), skills, services, stats — no duplicate animation layers |
| `src/components/Hero3D/Hero3D.js` | React Three Fiber scene: distorted torus knot + orbiting spheres, mouse-reactive. Lazy-loaded via `React.lazy` |
| `src/components/Projects/Projects.js` | Filter tabs + `CaseStudyModal` (problem / architecture / code snippet / metrics / lessons) |
| `src/components/Terminal/Terminal.js` | Keyboard-triggered CLI overlay. Commands: `help`, `about`, `skills`, `experience`, `projects`, `open <id>`, `cat <id>`, `goto <section>`, `clear`, `exit`. Tab-completion + history (↑/↓) |
| `src/components/LiveGithub/LiveGithub.js` | Pulls GitHub public API (`/users/PuditC/events`, `/repos`) for recent activity + lang stats + repo list + contribution calendar. Gracefully handles 403 rate-limit |
| `src/components/ExperienceTimeline/ExperienceTimeline.js` | Work history, data hardcoded inline |
| `src/components/Skills3D/Skills3DAlternative.js` | CSS 3D cube skill display |
| `src/components/About/About.js` | About, composing `AboutCard`, `Techstack`, `Toolstack`, `Github` |

### Data

Project data is the **one thing that's centralized** — `src/data/projects.js` is the single source of truth used by `Projects.js`, `Terminal.js`, and the case-study modal. Each project carries `problem`, `architecture[]`, `codeSnippet{language,code}`, `metrics[]`, `lessons`, `features[]` in addition to the basic card fields.

Everything else (experience, education, skills, services, stats) is still hardcoded inline in its respective component — fine for a single-author portfolio.

### Styling

Each component has a co-located `.css` file. Global styles in `src/style.css` and `src/App.css`. Theme: dark backgrounds with `#ff4757` as primary accent. Animations via **framer-motion v11** — note this version renamed `useViewportScroll` → `useScroll`; older code in this repo may still need updating if seen.

### 3D / bundle

`three`, `@react-three/fiber`, `@react-three/drei` ship in a separate lazy chunk (~230KB gz) so initial paint isn't blocked. A `@mediapipe/tasks-vision` source-map warning appears in builds — it's a transitive dep from drei and safe to ignore.

### Deployment

GitHub Actions (`.github/workflows/deploy.yml`) builds and deploys to GitHub Pages on every push to `main`. Uses `actions/deploy-pages@v4` — no `gh-pages` branch is required.

### Styling

Each component has a co-located `.css` file. Global styles are in `src/style.css` and `src/App.css`. The theme uses dark backgrounds with red (`#ff4757`) as the primary accent color. Animations are done with **framer-motion** throughout.

### Deployment

GitHub Actions (`.github/workflows/deploy.yml`) automatically builds and deploys to GitHub Pages on every push to `main`. The workflow uses `actions/deploy-pages@v4` — no `gh-pages` branch is required.
