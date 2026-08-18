#!/usr/bin/env node
/**
 * Renders every asset referenced by README.md into ./readme/.
 *
 *   node scripts/generate-readme-assets.mjs
 *
 * Deterministic: same inputs -> byte-identical output, so re-running never
 * creates a noisy diff. Reads data/contributions.json and data/profile.ts.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { palette as P, font as F, layout } from '../shared/theme.mjs';
import { mascotMarkup, mascotCss, webNet, spiderMark, MASCOT_VIEWBOX } from '../shared/mascot.mjs';
import {
  svgDoc,
  esc,
  R,
  panel,
  strand,
  cornerWeb,
  skyline,
  skylineCss,
  chipRow,
  chipCss,
  textWidth,
  wrap,
} from './lib/render.mjs';
import {
  sectionHeader,
  headerCss,
  statTile,
  tileCss,
  speechBubble,
  bubbleCss,
  particles,
  particleCss,
  bodyText,
} from './lib/panels.mjs';
import { buildCalendar, level, deriveStats, MONTHS } from './lib/contributions.mjs';
import { readProfile } from './lib/profile-loader.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'readme');
const W = layout.readmeWidth;

fs.mkdirSync(OUT, { recursive: true });

const profile = readProfile(path.join(ROOT, 'data', 'profile.ts'));
const contrib = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'contributions.json'), 'utf8'));

const written = [];
function write(name, svg) {
  const file = path.join(OUT, name);
  fs.writeFileSync(file, svg.replace(/\n\s*\n/g, '\n'));
  written.push([name, fs.statSync(file).size]);
}

/* ══════════════════════════════════════════════════════ 1. HANGING MASCOT */
function hangingMascot() {
  const w = 250;
  const h = 300;
  const scale = 0.62;
  const mx = (w - MASCOT_VIEWBOX.w * scale) / 2;
  const my = 92;

  const css = `
  ${mascotCss}
  @keyframes dropIn{0%{transform:translateY(-190px);opacity:0}18%{opacity:1}46%{transform:translateY(6px)}62%{transform:translateY(-3px)}78%,100%{transform:translateY(0)}}
  @keyframes lineGrow{0%{transform:scaleY(0)}30%,100%{transform:scaleY(1)}}
  @keyframes tinyShot{0%,64%{opacity:0;transform:scaleX(.2)}70%{opacity:1;transform:scaleX(1)}84%{opacity:1}92%,100%{opacity:0}}
  .rig{animation:dropIn 9s cubic-bezier(.25,.9,.35,1) infinite}
  .line{transform-box:fill-box;transform-origin:50% 0%;animation:lineGrow 9s cubic-bezier(.25,.9,.35,1) infinite}
  .tiny{transform-box:fill-box;transform-origin:0% 50%;animation:tinyShot 9s ease-out infinite}
  `;

  const body = `
  <g class="line">${strand(w / 2, 0, my + 26, { color: P.textFaint, w: 1.6 })}</g>
  <g class="rig">
    <g class="is-hang">
      <g transform="translate(${R(mx)} ${my}) scale(${scale})">${mascotMarkup({ uid: 'hang' })}</g>
    </g>
    <g class="tiny">
      <path d="M${R(mx + 150 * scale)} ${R(my + 186 * scale)} L${R(mx + 236 * scale)} ${R(my + 168 * scale)}"
            stroke="${P.textDim}" stroke-width="1.8" stroke-linecap="round" fill="none" opacity="0.9"/>
      <circle cx="${R(mx + 238 * scale)}" cy="${R(my + 167 * scale)}" r="2.6" fill="${P.textDim}"/>
    </g>
  </g>`;

  return svgDoc({
    w,
    h,
    title: 'Web-Byte, the spider-suited mascot, descending on a web strand',
    desc: 'Animated mascot lowering itself on a thread, swinging gently and flicking a small web.',
    css,
    body,
    bg: false,
  });
}

/* ═══════════════════════════════════════════════════════════════ 2. HERO */
function hero() {
  const h = 320;
  const scale = 0.92;
  const mx = 612;
  const my = 62;

  const css = `
  ${mascotCss}${skylineCss}${particleCss}${chipCss}${bubbleCss}
  @keyframes rise{0%{transform:translateY(16px)}100%{transform:translateY(0)}}
  .r1,.r2,.r3,.r4{transform-box:fill-box;animation:rise .7s cubic-bezier(.2,.9,.3,1)}
  .r2{animation-duration:.8s}.r3{animation-duration:.9s}.r4{animation-duration:1s}
  @keyframes sheen{0%,100%{opacity:.25}50%{opacity:.7}}
  .spot{animation:sheen 6s ease-in-out infinite}
  `;

  const defs = `
  <radialGradient id="spotG" cx="0.5" cy="0.42" r="0.55">
    <stop offset="0" stop-color="${P.red}" stop-opacity="0.4"/>
    <stop offset="0.6" stop-color="${P.navy}" stop-opacity="0.16"/>
    <stop offset="1" stop-color="${P.navy}" stop-opacity="0"/>
  </radialGradient>`;

  const stack = ['TypeScript', 'Next.js', 'React Native', 'FastAPI', 'Supabase'];
  const chips = chipRow(stack, { x: 44, y: 236, maxWidth: 520, accent: P.edgeHi, size: 12 });

  const body = `
  <g opacity="0.85">${skyline({ x: 0, y: h - 108, w: W, h: 108, seed: 11 })}</g>
  <rect y="${h - 108}" width="${W}" height="108" fill="url(#bgGrad)" opacity="0.55"/>
  ${particles(W, h - 60, 22, 5)}
  ${cornerWeb(W - 2, 2, 150, 1, P.edgeHi, 0.4)}
  ${cornerWeb(2, h - 2, 110, 3, P.edgeHi, 0.22)}

  <ellipse class="spot" cx="${mx + 110}" cy="${my + 150}" rx="180" ry="150" fill="url(#spotG)"/>
  ${strand(mx + 110, 0, my + 14, { color: P.textFaint, w: 1.4 })}
  <g class="is-idle"><g transform="translate(${mx} ${my}) scale(${scale})">${mascotMarkup({ uid: 'hero' })}</g></g>

  <g class="r1">
    <text x="44" y="76" font-size="12" class="faint mono" letter-spacing="3">${esc(
      `PICT PUNE · ${profile.education.degree.toUpperCase()}`
    )}</text>
  </g>
  <g class="r2">
    <text x="44" y="118" font-size="42" class="d t">${esc(profile.identity.shortName.toUpperCase())}</text>
    <path d="M44 138 H300" stroke="url(#redGrad)" stroke-width="3"/>
  </g>
  <g class="r3">
    <text x="44" y="164" font-size="15" class="red d" letter-spacing="1.2">${esc(
      profile.identity.role.toUpperCase()
    )}</text>
    ${bodyText(profile.identity.tagline, { x: 44, y: 194, maxWidth: 500, size: 13.5, lh: 20, cls: 'dim' })}
  </g>
  <g class="r4">${chips.markup}</g>`;

  return svgDoc({
    w: W,
    h,
    title: `${profile.identity.shortName} — ${profile.identity.role}`,
    desc: `Comic-book hero banner: ${profile.identity.shortName}, ${profile.identity.role}. ${profile.identity.tagline}`,
    css,
    defs,
    body,
  });
}

/* ═════════════════════════════════════════════════════════════ 3. DIVIDER */
function divider() {
  const h = 34;
  const y = 17;
  const css = `
  @keyframes crawl{0%{transform:translateX(0)}100%{transform:translateX(${W - 120}px)}}
  @keyframes legTwitch{0%,100%{transform:rotate(0)}50%{transform:rotate(3deg)}}
  .crawler{animation:crawl 22s linear infinite;transform-box:fill-box}
  .crawler g{animation:legTwitch .5s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 50%}
  @keyframes shimmer{0%,100%{opacity:.5}50%{opacity:.9}}
  .thread{animation:shimmer 5s ease-in-out infinite}
  `;
  const sag = [];
  for (let x = 40; x < W - 40; x += 56) {
    sag.push(`M${x} ${y}Q${x + 28} ${y + 7} ${x + 56} ${y}`);
  }
  const body = `
  <path class="thread" d="M0 ${y} H${W}" stroke="${P.edge}" stroke-width="1.2" fill="none"/>
  <path class="thread" d="${sag.join('')}" stroke="${P.edgeHi}" stroke-width="1" fill="none" opacity="0.7"/>
  <circle cx="6" cy="${y}" r="3" fill="${P.red}"/>
  <circle cx="${W - 6}" cy="${y}" r="3" fill="${P.navyGlow}"/>
  <g class="crawler"><g transform="translate(60 ${y}) scale(0.55)">${spiderMark(0, 0, 1, P.textDim)}</g></g>`;
  return svgDoc({
    w: W,
    h,
    title: 'Web strand divider with a small spider crawling along it',
    css,
    body,
    bg: false,
  });
}

/* ═══════════════════════════════════════════════════════ 4. SECTION HEADS */
function head(file, title, kicker) {
  write(
    file,
    svgDoc({
      w: W,
      h: 60,
      title: `${title} section heading`,
      css: headerCss,
      body: sectionHeader({ w: W, title, kicker }),
      bg: false,
    })
  );
}

/* ═════════════════════════════════════════════════════════════ 5. ARSENAL */
function arsenal() {
  const groups = profile.arsenal;
  const colW = (W - 24) / 2;
  let y = 8;
  const blocks = [];
  const heights = [];

  groups.forEach((grp, i) => {
    const col = i % 2;
    const x = col * (colW + 24);
    const chips = chipRow(grp.items, {
      x: x + 20,
      y: 0,
      maxWidth: colW - 40,
      accent: i % 2 ? P.navyGlow : P.edgeHi,
      size: 11.5,
      delayStep: 45,
    });
    heights[i] = 62 + chips.height + (grp.note ? 18 : 0);
  });

  // pair rows so both columns share the taller height
  const rowH = [];
  for (let i = 0; i < groups.length; i += 2) rowH.push(Math.max(heights[i], heights[i + 1] || 0));

  const total = rowH.reduce((a, b) => a + b + 18, 8) + 8;

  groups.forEach((grp, i) => {
    const row = Math.floor(i / 2);
    const col = i % 2;
    const x = col * (colW + 24);
    const py = 8 + rowH.slice(0, row).reduce((a, b) => a + b + 18, 0);
    const chips = chipRow(grp.items, {
      x: x + 20,
      y: py + 52,
      maxWidth: colW - 40,
      accent: col ? P.navyGlow : P.edgeHi,
      size: 11.5,
      delayStep: 45,
    });
    blocks.push(`
      ${panel({ x, y: py, w: colW, h: rowH[row], cut: 14, accent: col ? P.navy : P.red })}
      <text x="${x + 20}" y="${py + 28}" font-size="13" class="d red" letter-spacing="1.4">${esc(
        grp.label.toUpperCase()
      )}</text>
      ${grp.note ? `<text x="${x + colW - 20}" y="${py + 28}" font-size="10.5" class="faint" text-anchor="end">${esc(grp.note)}</text>` : ''}
      ${chips.markup}
      ${cornerWeb(x + colW - 1, py + 1, 40, 1, P.edgeHi, 0.28)}
    `);
  });

  return svgDoc({
    w: W,
    h: total,
    title: 'Spider Arsenal — languages, frameworks, databases, tools',
    desc: groups.map((g) => `${g.label}: ${g.items.join(', ')}`).join('. '),
    css: `${chipCss}`,
    body: blocks.join(''),
    bg: false,
  });
}

/* ════════════════════════════════════════════════════════════ 6. MISSIONS */
function missions() {
  const cards = profile.missions;
  const cardH = 168;
  const gap = 16;
  const h = cards.length * (cardH + gap) + 8;

  const body = cards
    .map((m, i) => {
      const y = 4 + i * (cardH + gap);
      const chips = chipRow(m.stack, {
        x: 24,
        y: y + 100,
        maxWidth: W - 60,
        accent: i % 2 ? P.navyGlow : P.edgeHi,
        size: 11,
        delayStep: 40,
      });

      // metrics run left→right and finish flush with the right edge
      const MW = 96;
      const metricsX = W - 28 - m.metrics.length * MW;
      const metrics = m.metrics
        .map(
          (mt, k) =>
            `<g class="tile" style="animation-delay:${300 + k * 90}ms">
              <text x="${R(metricsX + k * MW + MW - 12)}" y="${y + 52}" font-size="19" class="d" fill="${
              P.redBright
            }" text-anchor="end">${esc(mt.k)}</text>
              <text x="${R(metricsX + k * MW + MW - 12)}" y="${y + 71}" font-size="10" class="faint" text-anchor="end">${esc(
              mt.v
            )}</text>
            </g>`
        )
        .join('');

      const badgeW = R(textWidth(m.badge, 10) * 1.22 + 26);
      const badge = m.badge
        ? `<g class="tile" style="animation-delay:220ms">
             <rect x="${W - 28 - badgeW}" y="${y + 20}" width="${badgeW}" height="19" rx="9.5" fill="${
            i === 0 ? P.red : P.navy
          }"/>
             <text x="${R(W - 28 - badgeW / 2)}" y="${y + 30}" font-size="10" class="d" fill="#FFF3F1" text-anchor="middle">${esc(
            m.badge.toUpperCase()
          )}</text>
           </g>`
        : '';

      return `
      ${panel({ x: 0, y, w: W, h: cardH, cut: 18, accent: i === 0 ? P.red : P.navy })}
      <text x="24" y="${y + 30}" font-size="11" class="d" fill="${P.textFaint}" letter-spacing="2.4">${esc(m.code)}</text>
      <text x="24" y="${y + 58}" font-size="25" class="d t">${esc(m.name)}</text>
      <text x="24" y="${y + 80}" font-size="12.5" class="dim">${esc(m.subtitle)}</text>
      ${badge}
      ${chips.markup}
      ${bodyText(m.bullets[0], { x: 24, y: y + 140, maxWidth: W - 56, size: 12, lh: 17, cls: 'dim' })}
      ${metrics}
      ${cornerWeb(W - 1, y + 1, 56, 1, P.edgeHi, 0.3)}`;
    })
    .join('');

  return svgDoc({
    w: W,
    h,
    title: 'Project missions',
    desc: cards.map((m) => `${m.name}: ${m.subtitle}. Built with ${m.stack.join(', ')}.`).join(' '),
    css: `${chipCss}${tileCss}`,
    body,
    bg: false,
  });
}

/* ═══════════════════════════════════════════════ 7. CONTRIBUTION WEB (⭐) */
function contributionWeb() {
  const cal = buildCalendar(contrib);
  const stats = deriveStats(contrib, cal);

  const CELL = 11;
  const GAP = 3;
  const STEP = CELL + GAP;
  const gridX = 46;
  const gridY = 96;
  const gridW = cal.weeks.length * STEP;
  const h = gridY + 7 * STEP + 74;

  /* --- cells --- */
  const cells = [];
  const hot = [];
  cal.weeks.forEach((col, ci) => {
    col.forEach((cell, ri) => {
      if (cell.count === null) return;
      const lv = level(cell.count, cal.max);
      const x = R(gridX + ci * STEP);
      const y = R(gridY + ri * STEP);
      // cascade: one wave sweeping left -> right across the year
      const delay = R((ci / cal.weeks.length) * 1800 + ri * 30);
      cells.push(
        `<rect class="c l${lv}" x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="2.6" fill="${P.ramp[lv]}" style="animation-delay:${delay}ms"><title>${esc(
          `${cell.date}: ${cell.count} contribution${cell.count === 1 ? '' : 's'}`
        )}</title></rect>`
      );
      if (lv >= 3) hot.push({ x: x + CELL / 2, y: y + CELL / 2, lv, delay, count: cell.count });
    });
  });

  /* --- web strands linking the busiest cells --- */
  hot.sort((a, b) => a.x - b.x || a.y - b.y);
  const links = [];
  for (let i = 0; i < hot.length - 1; i++) {
    const a = hot[i];
    const b = hot[i + 1];
    if (Math.hypot(b.x - a.x, b.y - a.y) > 64) continue;
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2 + 9;
    links.push(
      `<path class="lnk" d="M${R(a.x)} ${R(a.y)}Q${R(mx)} ${R(my)} ${R(b.x)} ${R(b.y)}" fill="none" stroke="${
        P.redBright
      }" stroke-width="0.9" opacity="0.5" style="animation-delay:${R(a.delay + 260)}ms"/>`
    );
  }

  /* --- web pulse rings on the very hottest days --- */
  const pulses = hot
    .filter((p) => p.lv === 4)
    .slice(0, 14)
    .map(
      (p, i) =>
        `<circle class="pulse" cx="${R(p.x)}" cy="${R(p.y)}" r="4" fill="none" stroke="${P.redBright}" stroke-width="1.2" style="animation-delay:${R(
          p.delay + 120
        )}ms"/>`
    )
    .join('');

  /* --- month + weekday labels --- */
  const monthLabels = cal.months
    .map(
      (m) =>
        `<text x="${R(gridX + m.col * STEP)}" y="${gridY - 12}" font-size="10" class="faint">${esc(m.label)}</text>`
    )
    .join('');
  const dayLabels = ['Mon', 'Wed', 'Fri']
    .map(
      (d, i) =>
        `<text x="${gridX - 10}" y="${R(gridY + (i * 2 + 1) * STEP + CELL / 2)}" font-size="9.5" class="faint" text-anchor="end">${d}</text>`
    )
    .join('');

  /* --- legend --- */
  const legendX = gridX + gridW - 150;
  const legendY = gridY + 7 * STEP + 20;
  const legend = `
    <text x="${legendX - 8}" y="${legendY + 6}" font-size="10" class="faint" text-anchor="end">Less</text>
    ${P.ramp
      .map(
        (c, i) =>
          `<rect x="${legendX + i * 15}" y="${legendY}" width="11" height="11" rx="2.6" fill="${c}" stroke="${P.edge}" stroke-width="0.6"/>`
      )
      .join('')}
    <text x="${legendX + 5 * 15 + 2}" y="${legendY + 6}" font-size="10" class="faint">More</text>`;

  const css = `
  ${skylineCss}
  /* additive motion only — cells are visible at their base style at all times */
  @keyframes cellIn{0%{transform:scale(.35)}72%{transform:scale(1.2)}100%{transform:scale(1)}}
  .c{transform-box:fill-box;transform-origin:50% 50%;animation:cellIn .55s cubic-bezier(.3,1.4,.5,1)}
  @keyframes lnkIn{0%{stroke-dasharray:0 400}100%{stroke-dasharray:400 0}}
  .lnk{opacity:.5;animation:lnkIn .8s ease-out}
  @keyframes pulseOut{0%{r:3;opacity:0}25%{opacity:.85}100%{r:15;opacity:0}}
  .pulse{opacity:0;animation:pulseOut 2.6s ease-out infinite}
  @keyframes glow{0%,100%{opacity:.85}50%{opacity:1}}
  .l4{animation:cellIn .55s cubic-bezier(.3,1.4,.5,1), glow 3s ease-in-out infinite 1.2s}
  `;

  const from = contrib.range.from;
  const to = contrib.range.to;

  const body = `
  ${panel({ x: 0, y: 0, w: W, h, cut: 20, accent: P.red, fill: P.panel })}
  ${cornerWeb(W - 1, 1, 120, 1, P.edgeHi, 0.3)}
  <text x="24" y="36" font-size="15" class="d t">Every commit spins another thread.</text>
  <text x="24" y="58" font-size="11.5" class="faint">${esc(`@${contrib.login} · custom calendar, refreshed daily by GitHub Actions`)}</text>
  <text x="${W - 24}" y="32" font-size="26" class="d" fill="${P.redBright}" text-anchor="end">${cal.total.toLocaleString(
    'en-US'
  )}</text>
  <text x="${W - 24}" y="54" font-size="10.5" class="faint" text-anchor="end">${esc(
    `contributions · ${from} → ${to}`
  )}</text>
  ${monthLabels}${dayLabels}
  ${cells.join('')}
  ${links.join('')}
  ${pulses}
  ${legend}
  <text x="24" y="${legendY + 6}" font-size="10.5" class="faint">${esc(
    `${stats.activeDays} active days · best day ${stats.bestDay.count} on ${stats.bestDay.date} · longest streak ${stats.longestStreak} days`
  )}</text>`;

  return {
    svg: svgDoc({
      w: W,
      h,
      title: `Contribution web — ${cal.total} contributions from ${from} to ${to}`,
      desc: `A spider-web styled GitHub contribution calendar for ${contrib.login}: ${cal.total} contributions between ${from} and ${to}, ${stats.activeDays} active days, longest streak ${stats.longestStreak} days.`,
      css,
      body,
      bg: false,
    }),
    cal,
    stats,
  };
}

/* ═══════════════════════════════════════════════════════════════ 8. STATS */
const prettyDay = (iso) => {
  if (!iso) return '—';
  const [, m, d] = iso.split('-');
  return `${MONTHS[Number(m) - 1].toUpperCase()} ${Number(d)}`;
};

function statsPanel(cal, stats) {
  const h = 132;
  const tw = (W - 4 * 14) / 4;
  const tiles = [
    { v: cal.total.toLocaleString('en-US'), l: 'CONTRIBUTIONS · 12 MO' },
    { v: String(stats.activeDays), l: 'ACTIVE DAYS' },
    { v: String(stats.bestDay.count), l: `BEST DAY · ${prettyDay(stats.bestDay.date)}` },
    { v: `${stats.longestStreak}d`, l: 'LONGEST STREAK' },
  ];
  const body = tiles
    .map((t, i) => statTile({ x: i * (tw + 14), y: 8, w: tw, h: h - 24, value: t.v, label: t.l, delay: i * 110 }))
    .join('');
  return svgDoc({
    w: W,
    h,
    title: 'GitHub activity summary',
    desc: tiles.map((t) => `${t.l}: ${t.v}`).join('. '),
    css: tileCss,
    body,
    bg: false,
  });
}

/* ════════════════════════════════════════════════════════ 9. ACHIEVEMENTS */
function achievements() {
  const items = profile.achievements;
  const rowH = 82;
  const h = items.length * (rowH + 12) + 8;
  const icon = (kind, x, y) => {
    if (kind === 'win')
      return `<g><circle cx="${x}" cy="${y}" r="17" fill="${P.red}"/><path d="M${x - 7} ${y - 6}h14v5a7 7 0 0 1-14 0Z" fill="#FFF1EE"/><path d="M${
        x - 3
      } ${y + 1}h6v7h-6Z" fill="#FFF1EE"/><path d="M${x - 7} ${y + 8}h14v2.5h-14Z" fill="#FFF1EE"/></g>`;
    if (kind === 'score')
      return `<g><circle cx="${x}" cy="${y}" r="17" fill="${P.navy}"/><path d="M${x - 8} ${y + 5} l5 -9 l4 5 l6 -11" fill="none" stroke="#DCE6FF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></g>`;
    return `<g><circle cx="${x}" cy="${y}" r="17" fill="${P.panelHi}" stroke="${P.edgeHi}" stroke-width="1.2"/>${spiderMark(
      x,
      y,
      0.62,
      P.textDim
    )}</g>`;
  };

  const body = items
    .map((a, i) => {
      const y = 4 + i * (rowH + 12);
      return `
      ${panel({ x: 0, y, w: W, h: rowH, cut: 12, accent: a.kind === 'win' ? P.red : P.navy })}
      ${icon(a.kind, 40, y + rowH / 2)}
      <text x="76" y="${y + 28}" font-size="15" class="d t">${esc(a.title)}</text>
      ${bodyText(a.detail, { x: 76, y: y + 50, maxWidth: W - 110, size: 11.5, lh: 16, cls: 'dim' })}`;
    })
    .join('');

  return svgDoc({
    w: W,
    h,
    title: 'Achievements',
    desc: items.map((a) => `${a.title}. ${a.detail}`).join(' '),
    css: tileCss,
    body,
    bg: false,
  });
}

/* ═════════════════════════════════════════════════════════════ 10. FOOTER */
function footer() {
  const h = 214;
  const css = `${skylineCss}${particleCss}${bubbleCss}${mascotCss}
  @keyframes swingRig{0%,100%{transform:rotate(-7deg)}50%{transform:rotate(7deg)}}
  .rig{transform-box:fill-box;transform-origin:50% 0%;animation:swingRig 5.4s ease-in-out infinite}
  `;

  // web strands slung between rooftops
  const slings = [];
  const pts = [
    [88, 118, 236, 104],
    [300, 96, 452, 118],
    [520, 110, 664, 92],
    [700, 100, 838, 116],
  ];
  for (const [x1, y1, x2, y2] of pts) {
    const mx = (x1 + x2) / 2;
    const my = Math.max(y1, y2) + 26;
    slings.push(
      `<path d="M${x1} ${y1}Q${mx} ${my} ${x2} ${y2}" fill="none" stroke="${P.edgeHi}" stroke-width="1" opacity="0.55"/>`
    );
  }

  const scale = 0.34;
  const mx = 452;
  const my = 70;

  const body = `
  ${particles(W, h - 40, 16, 9)}
  ${slings.join('')}
  <g class="rig">
    ${strand(mx + (MASCOT_VIEWBOX.w * scale) / 2, 0, my + 8, { color: P.textFaint, w: 1.2, ticks: false })}
    <g class="is-idle"><g transform="translate(${mx} ${my}) scale(${scale})">${mascotMarkup({ uid: 'ftr' })}</g></g>
  </g>
  <g>${skyline({ x: 0, y: h - 96, w: W, h: 96, seed: 23 })}</g>
  <rect y="${h - 26}" width="${W}" height="26" fill="${P.void}" opacity="0.92"/>
  <text x="${W / 2}" y="${h - 12}" font-size="10.5" class="faint mono" text-anchor="middle">${esc(
    'next.js + framer motion prototype · exported to animated svg · npm run assets'
  )}</text>`;

  return svgDoc({
    w: W,
    h,
    title: 'City skyline footer with web strands between the buildings',
    css,
    body,
    bg: false,
  });
}

/* ════════════════════════════════════════════════════════════ 11. CONTACT */
function contact() {
  const h = 150;
  const css = `${bubbleCss}${chipCss}${mascotCss}`;
  const scale = 0.36;
  const body = `
  ${panel({ x: 0, y: 0, w: W, h, cut: 18, accent: P.red })}
  ${cornerWeb(1, 1, 90, 0, P.edgeHi, 0.3)}
  <g class="is-excited"><g transform="translate(30 ${R(h - 14 - 240 * scale)}) scale(${scale})">${mascotMarkup({
    uid: 'ct',
    showTail: true,
  })}</g></g>
  ${speechBubble({ x: 140, y: 26, text: profile.speech.contact, size: 19 })}
  <text x="330" y="46" font-size="13" class="dim">${esc(profile.identity.email)}</text>
  <text x="330" y="70" font-size="13" class="dim">${esc('github.com/' + profile.identity.handle)}</text>
  <text x="330" y="94" font-size="13" class="dim">${esc('linkedin.com/in/srushti-kalokhe-95a887385')}</text>
  <text x="330" y="118" font-size="13" class="dim">${esc(profile.identity.location)}</text>`;
  return svgDoc({
    w: W,
    h,
    title: 'Contact panel',
    desc: `Contact ${profile.identity.shortName}: ${profile.identity.email}, github.com/${profile.identity.handle}`,
    css,
    body,
    bg: false,
  });
}

/* ═════════════════════════════════════════════════════ 12. STANDALONE ART */
function mascotStandalone(state, title) {
  return svgDoc({
    w: MASCOT_VIEWBOX.w,
    h: MASCOT_VIEWBOX.h,
    title,
    css: mascotCss,
    body: `<g class="is-${state}">${mascotMarkup({ uid: state })}</g>`,
    bg: false,
  });
}

function webMotif() {
  const s = 220;
  return svgDoc({
    w: s,
    h: s,
    title: 'Spider web motif',
    css: `@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}
          .netw{transform-box:fill-box;transform-origin:50% 50%;animation:spin 90s linear infinite}`,
    body: `<g class="netw"><path d="${webNet({
      cx: s / 2,
      cy: s / 2,
      radii: [22, 40, 60, 80, 100],
      spokes: 12,
      from: -Math.PI,
      to: Math.PI,
      sag: 0.86,
    })}" fill="none" stroke="${P.edgeHi}" stroke-width="1.1" stroke-linecap="round" opacity="0.75"/></g>`,
    bg: false,
  });
}

/* ══════════════════════════════════════════════════════════════════ BUILD */
write('hanging-mascot.svg', hangingMascot());
write('hero.svg', hero());
write('divider.svg', divider());
head('sec-about.svg', 'ABOUT', 'origin story');
head('sec-arsenal.svg', 'SPIDER ARSENAL', 'tools of the trade');
head('sec-missions.svg', 'MISSIONS', 'things I shipped');
head('sec-contrib.svg', 'CONTRIBUTION WEB', 'live from github');
head('sec-stats.svg', 'SIGNAL', 'activity readout');
head('sec-achievements.svg', 'ACHIEVEMENTS', 'wall of wins');
head('sec-contact.svg', 'CONTACT', 'open a thread');
write('arsenal.svg', arsenal());
write('missions.svg', missions());
const cw = contributionWeb();
write('contribution-web.svg', cw.svg);
write('stats.svg', statsPanel(cw.cal, cw.stats));
write('achievements.svg', achievements());
write('contact.svg', contact());
write('skyline.svg', footer());
write('mascot.svg', mascotStandalone('idle', 'Web-Byte mascot, idle'));
write('mascot-webshoot.svg', mascotStandalone('webshoot', 'Web-Byte mascot firing a web'));
write('mascot-static.svg', mascotStandalone('static', 'Web-Byte mascot, static fallback'));
write('web-motif.svg', webMotif());

/* ------------------------------------------------------------------ report */
const total = written.reduce((a, [, s]) => a + s, 0);
console.log('\n  readme/ assets\n  ' + '─'.repeat(46));
for (const [n, s] of written.sort((a, b) => b[1] - a[1])) {
  console.log(`  ${n.padEnd(28)} ${(s / 1024).toFixed(1).padStart(7)} KB`);
}
console.log('  ' + '─'.repeat(46));
console.log(`  ${String(written.length).padEnd(28)} ${(total / 1024).toFixed(1).padStart(7)} KB total\n`);
