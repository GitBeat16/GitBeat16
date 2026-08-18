#!/usr/bin/env node
/**
 * Pulls the real contribution calendar for the profile owner and rewrites
 * data/contributions.json. Run it, then regenerate the assets:
 *
 *   npm run sync            # both steps
 *   npm run sync:contributions
 *
 * Two sources, tried in order:
 *
 *   1. GitHub GraphQL API  — exact, needs a token in GITHUB_TOKEN.
 *      Inside GitHub Actions the built-in secrets.GITHUB_TOKEN is enough.
 *      Locally, any classic PAT with `read:user` works.
 *
 *   2. The public contributions fragment at
 *      https://github.com/users/<login>/contributions — no auth, parsed from
 *      the `data-date` / `data-level` attributes GitHub renders.
 *
 * Exit codes: 0 written, 1 both sources failed (the existing file is kept).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.resolve(__dirname, '..', 'data', 'contributions.json');

const current = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const LOGIN = process.env.GITHUB_LOGIN || current.login;
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

const UA = { 'User-Agent': 'spidey-profile-asset-generator' };

/* ------------------------------------------------------------- GraphQL */
async function viaGraphQL() {
  if (!TOKEN) return null;
  const query = `
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks { contributionDays { date contributionCount } }
          }
        }
      }
    }`;

  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { ...UA, Authorization: `bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { login: LOGIN } }),
  });
  if (!res.ok) throw new Error(`GraphQL ${res.status} ${res.statusText}`);

  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join('; '));

  const calendar = json.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar) throw new Error(`no calendar returned for ${LOGIN}`);

  const days = {};
  const all = calendar.weeks.flatMap((w) => w.contributionDays);
  for (const d of all) if (d.contributionCount > 0) days[d.date] = d.contributionCount;

  return {
    days,
    from: all[0].date,
    to: all[all.length - 1].date,
    reported: calendar.totalContributions,
    source: 'GitHub GraphQL API (contributionsCollection)',
  };
}

/* ------------------------------------------------------- public scrape */
async function viaPublicCalendar() {
  const url = `https://github.com/users/${encodeURIComponent(LOGIN)}/contributions`;
  const res = await fetch(url, { headers: { ...UA, Accept: 'text/html' } });
  if (!res.ok) throw new Error(`calendar ${res.status} ${res.statusText}`);
  const html = await res.text();

  const days = {};
  const dates = [];

  // <td ... data-date="2026-08-17" data-level="2" ...>  + an adjacent tooltip
  const cellRe = /<td[^>]*data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-level="(\d)"[^>]*>/g;
  const idRe = /id="([^"]+)"/;
  let m;
  const levels = new Map();
  const ids = new Map();
  while ((m = cellRe.exec(html))) {
    dates.push(m[1]);
    levels.set(m[1], Number(m[2]));
    const idm = idRe.exec(m[0]);
    if (idm) ids.set(idm[1], m[1]);
  }
  if (!dates.length) throw new Error('no contribution cells found in the public calendar');

  // exact counts live in the tooltips: <tool-tip for="contribution-day-…">N contributions on …</tool-tip>
  const tipRe = /<tool-tip[^>]*for="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g;
  while ((m = tipRe.exec(html))) {
    const date = ids.get(m[1]);
    if (!date) continue;
    const n = /^No contributions/i.test(m[2].trim()) ? 0 : parseInt(m[2], 10);
    if (Number.isFinite(n) && n > 0) days[date] = n;
  }

  // fall back to level midpoints only if tooltips were unavailable
  if (Object.keys(days).length === 0) {
    const MID = [0, 1, 3, 6, 10];
    for (const [date, lv] of levels) if (lv > 0) days[date] = MID[lv];
    console.warn('  ! tooltips missing — approximated counts from data-level');
  }

  dates.sort();
  const totalMatch = html.match(/([\d,]+)\s+contributions?\s+in\s+the\s+last\s+year/i);

  return {
    days,
    from: dates[0],
    to: dates[dates.length - 1],
    reported: totalMatch ? Number(totalMatch[1].replace(/,/g, '')) : undefined,
    source: 'public GitHub contributions calendar',
  };
}

/* ------------------------------------------------------------------ run */
async function main() {
  console.log(`\n  syncing contributions for @${LOGIN}`);

  let result = null;
  const errors = [];

  for (const [name, fn] of [
    ['GraphQL API', viaGraphQL],
    ['public calendar', viaPublicCalendar],
  ]) {
    try {
      const r = await fn();
      if (r) {
        result = r;
        console.log(`  ✓ ${name}`);
        break;
      }
      console.log(`  – ${name} skipped (no GITHUB_TOKEN)`);
    } catch (err) {
      errors.push(`${name}: ${err.message}`);
      console.log(`  ✗ ${name}: ${err.message}`);
    }
  }

  if (!result) {
    console.error('\n  could not sync; leaving data/contributions.json untouched');
    for (const e of errors) console.error(`    ${e}`);
    process.exit(1);
  }

  const total = Object.values(result.days).reduce((a, b) => a + b, 0);
  const out = {
    login: LOGIN,
    syncedAt: new Date().toISOString().slice(0, 10),
    source: result.source,
    range: { from: result.from, to: result.to },
    days: Object.fromEntries(Object.entries(result.days).sort(([a], [b]) => (a < b ? -1 : 1))),
  };

  fs.writeFileSync(FILE, `${JSON.stringify(out, null, 2)}\n`);

  console.log(`  ${Object.keys(out.days).length} active days · ${total} contributions`);
  if (result.reported !== undefined && result.reported !== total) {
    console.log(`  note: GitHub reports ${result.reported} for the same window`);
  }
  console.log(`  wrote ${path.relative(process.cwd(), FILE)}`);
  console.log('  now run: npm run assets\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
