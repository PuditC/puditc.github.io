#!/usr/bin/env node
/* Smoke test for the static site in ./site
   Every local href/src in every page must point at a file that exists.
   Catches the classic static-site break: a page renamed, a link left behind. */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = join(ROOT, 'site');

if (!existsSync(SITE)) {
  console.error(`FAIL: ${relative(ROOT, SITE)}/ does not exist`);
  process.exit(1);
}

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]
  );

const pages = walk(SITE).filter((f) => f.endsWith('.html'));
if (pages.length === 0) {
  console.error('FAIL: no HTML pages found in site/');
  process.exit(1);
}

const EXTERNAL = /^(https?:|mailto:|tel:|data:|javascript:|#|\/\/)/i;
const problems = [];
let checked = 0;

for (const page of pages) {
  // Inline scripts build markup at runtime (`href="${r.html_url}"`); only the
  // static markup can be checked, so drop script bodies before matching.
  const html = readFileSync(page, 'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  const refs = [...html.matchAll(/(?:href|src)\s*=\s*"([^"]+)"/gi)].map((m) => m[1]);

  for (const raw of refs) {
    if (!raw || EXTERNAL.test(raw) || raw.includes('${')) continue;
    const clean = decodeURIComponent(raw.split('#')[0].split('?')[0]);
    if (!clean) continue;

    const target = clean.startsWith('/')
      ? join(SITE, clean.slice(1))
      : resolve(dirname(page), clean);

    checked++;
    if (!existsSync(target) || !statSync(target).isFile()) {
      problems.push(`${relative(ROOT, page)} → ${raw}`);
    }
  }
}

if (problems.length) {
  console.error(`FAIL: ${problems.length} broken local link(s):`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}

console.log(`OK: ${pages.length} page(s), ${checked} local link(s), all resolve.`);
