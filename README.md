# Pudit Portfolio

A personal portfolio site — plain HTML, CSS and JavaScript. No framework, no build step,
no runtime dependencies.

## 📁 Project structure

- `site/` — the site itself. This is what gets published.
- `scripts/check-links.mjs` — smoke test: every local link in `site/` must resolve.
- `.github/workflows/` — GitHub Actions configuration.
- `src/`, `public/` — the previous React version. No longer deployed; kept pending removal.

## 📦 Local development

There is nothing to install and nothing to compile. Edit the files in `site/` and reload.

To preview over HTTP (needed for the pages that call the GitHub API):

```bash
python -m http.server 8080 --directory site
# then open http://127.0.0.1:8080/
```

## 🛠️ Available scripts

- `npm run check` — verify every local link in `site/` points at a file that exists
- `npm run deploy` — manually publish `site/` to GitHub Pages

## 🚀 Deployment

GitHub Actions publishes `site/` to the `gh-pages` branch on every push to `main` — no install,
no build. A second workflow runs the link check and a gitleaks secret scan on every push and
pull request.
