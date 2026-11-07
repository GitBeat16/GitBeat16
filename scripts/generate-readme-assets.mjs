#!/usr/bin/env node
/**
 * Renders every asset referenced by README.md into ./readme/.
 *
 *   node scripts/generate-readme-assets.mjs
 *
 * Deterministic: same inputs -> byte-identical output, so re-running never
 * creates a noisy diff. Reads data/profile.ts.
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
import { icon } from './lib/icons.mjs';
import { readProfile } from './lib/profile-loader.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'readme');
const W = layout.readmeWidth;

fs.mkdirSync(OUT, { recursive: true });

const profile = readProfile(path.join(ROOT, 'data', 'profile.ts'));

/* One type scale for every panel, so the README reads as a single document. */
const TYPE = { title: 16, body: 13, bodyLh: 19, label: 11, chip: 11.5, note: 11 };

const written = [];
function write(name, svg) {
  const file = path.join(OUT, name);
  fs.writeFileSync(file, svg.replace(/\n\s*\n/g, '\n'));
  written.push([name, fs.statSync(file).size]);
}

/* ══════════════════════════════════════════════════════ 1. HANGING MASCOT */
/**
 * Long-drop easter egg. The mascot pays out a full-height strand, hangs and
 * sways at the bottom, then reels itself back up. The canvas is deliberately
 * tall so the descent reads as a real drop rather than a nudge — the mascot
 * itself stays at its original scale.
 */
function hangingMascot() {
  const w = 260;
  const h = 520;
  const scale = 0.62;
  const mx = R((w - MASCOT_VIEWBOX.w * scale) / 2);
  const my = 344; // resting Y of the mascot's own top edge
  const drop = 322; // how far it travels between the top and the resting spot

  const css = `
  ${mascotCss}
  @keyframes payOut{
    0%,6%{transform:translateY(-${drop}px)}
    40%{transform:translateY(14px)}
    50%{transform:translateY(-8px)}
    58%,84%{transform:translateY(0)}
    100%{transform:translateY(-${drop}px)}
  }
  @keyframes lineOut{
    0%,6%{transform:scaleY(.055)}
    40%{transform:scaleY(1.04)}
    58%,84%{transform:scaleY(1)}
    100%{transform:scaleY(.055)}
  }
  @keyframes sway{0%,100%{transform:rotate(-4.5deg)}50%{transform:rotate(4.5deg)}}
  @keyframes tinyShot{0%,66%{transform:scaleX(.05)}72%{transform:scaleX(1)}80%{transform:scaleX(1)}84%,100%{transform:scaleX(.05)}}
  .swing{transform-box:fill-box;transform-origin:50% 0%;animation:sway 4.6s ease-in-out infinite}
  .rig{animation:payOut 13s cubic-bezier(.3,.85,.35,1) infinite}
  .line{transform-box:fill-box;transform-origin:50% 0%;animation:lineOut 13s cubic-bezier(.3,.85,.35,1) infinite}
  .tiny{transform-box:fill-box;transform-origin:0% 50%;animation:tinyShot 13s ease-out infinite}
  `;

  const body = `
  <g class="swing">
    <g class="line">${strand(w / 2, 0, my + 26, { color: P.textFaint, w: 1.6 })}</g>
    <g class="rig">
      <g class="is-hang">
        <g transform="translate(${mx} ${my}) scale(${scale})">${mascotMarkup({ uid: 'hang' })}</g>
      </g>
      <g class="tiny">
        <path d="M${R(mx + 150 * scale)} ${R(my + 186 * scale)} L${R(mx + 232 * scale)} ${R(my + 168 * scale)}"
              stroke="${P.textDim}" stroke-width="1.8" stroke-linecap="round" fill="none" opacity="0.9"/>
        <circle cx="${R(mx + 234 * scale)}" cy="${R(my + 167 * scale)}" r="2.6" fill="${P.textDim}"/>
      </g>
    </g>
  </g>`;

  return svgDoc({
    w,
    h,
    title: 'Web-Byte, the spider-suited mascot, abseiling down a long web strand',
    desc: 'Animated mascot paying out a long thread, hanging and swaying at the bottom, then climbing back up.',
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
  @keyframes liRing{0%{transform:scale(1);opacity:.75}70%,100%{transform:scale(1.12,1.45);opacity:0}}
  .liRing{transform-box:fill-box;transform-origin:50% 50%;animation:liRing 2.6s ease-out infinite;opacity:0}
  @keyframes liShine{0%,55%{transform:translateX(0)}100%{transform:translateX(320px)}}
  .liShine{animation:liShine 3.4s ease-in-out infinite}
  @keyframes liEdge{0%,100%{stroke-opacity:.6}50%{stroke-opacity:1}}
  .liEdge{animation:liEdge 2.6s ease-in-out infinite}
  @keyframes liArrow{0%,100%{transform:translate(0,0)}50%{transform:translate(2px,-2px)}}
  .liArrow{animation:liArrow 1.3s ease-in-out infinite}
  `;

  const defs = `
  <radialGradient id="spotG" cx="0.5" cy="0.42" r="0.55">
    <stop offset="0" stop-color="${P.red}" stop-opacity="0.4"/>
    <stop offset="0.6" stop-color="${P.navy}" stop-opacity="0.16"/>
    <stop offset="1" stop-color="${P.navy}" stop-opacity="0"/>
  </radialGradient>`;

  const chips = chipRow(profile.identity.heroStack, { x: 44, y: 224, maxWidth: 520, accent: P.edgeHi, size: TYPE.chip });

  /* LinkedIn call-to-action under the stack chips. Links inside an
     <img>-embedded SVG are inert on GitHub, so README.md wraps the whole hero
     in a link to LinkedIn — clicking the pill (or anywhere on the banner) opens it. */
  const li = `in/${profile.identity.linkedinHandle}`;
  const ph = 32;
  const pw = R(textWidth(li, 13) * 1.12 + 92);
  const px = 44;
  const py = 266;
  const pill = `
  <g class="r4">
    <rect class="liRing" x="${px}" y="${py}" width="${pw}" height="${ph}" rx="${ph / 2}" fill="none" stroke="${P.navyGlow}" stroke-width="2"/>
    <rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="${ph / 2}" fill="url(#liFill)"/>
    <g clip-path="url(#liClip)"><rect class="liShine" x="${px - 60}" y="${py - 4}" width="34" height="${ph + 8}" fill="#FFFFFF" opacity="0.16" transform="skewX(-20)"/></g>
    <rect class="liEdge" x="${px}" y="${py}" width="${pw}" height="${ph}" rx="${ph / 2}" fill="none" stroke="${P.navyGlow}" stroke-width="1.5"/>
    ${icon('linkedin', px + 21, py + ph / 2, 16, '#DCE4FF')}
    <text x="${px + 38}" y="${R(py + ph / 2 + 0.5)}" font-size="13" class="d" fill="#EEF1FF">${esc(li)}</text>
    <g class="liArrow"><path d="M${R(px + pw - 26)} ${py + ph / 2 + 4} l8 -8 M${R(px + pw - 24)} ${py + ph / 2 - 4} h6 v6" stroke="#DCE4FF" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
  </g>`;
  const liDefs = `
  <linearGradient id="liFill" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${P.navyLift}"/>
    <stop offset="1" stop-color="${P.navy}"/>
  </linearGradient>
  <clipPath id="liClip"><rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="${ph / 2}"/></clipPath>`;

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
      `PICT PUNE · ${profile.education.field.toUpperCase()}`
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
    <text x="44" y="194" font-size="14" class="dim">${esc(profile.identity.tagline)}</text>
  </g>
  <g class="r4">${chips.markup}</g>
  ${pill}`;

  return svgDoc({
    w: W,
    h,
    title: `${profile.identity.shortName} — ${profile.identity.role}`,
    desc: `Comic-book hero banner: ${profile.identity.shortName}, ${profile.identity.role}. ${profile.identity.tagline}`,
    css,
    defs: defs + liDefs,
    body,
  });
}

/* ═════════════════════════════════════════════════════════════ 3. DIVIDER */
function divider() {
  // The spider is authored around (0,0) and spans roughly ±10 units before
  // scaling, so the strip has to be tall enough to hold it whole. Previously
  // the leg-twitch rule matched the *placement* group too, and a CSS transform
  // replaces the transform attribute outright — which threw away the
  // translate/scale and left the spider clipped by the top edge. The twitch now
  // lives on its own inner group that carries no transform attribute.
  const h = 46;
  const y = 23;
  const spiderScale = 0.86;
  const travel = W - 140;
  const css = `
  @keyframes crawl{0%{transform:translateX(0)}50%{transform:translateX(${R(travel)}px)}100%{transform:translateX(0)}}
  @keyframes legTwitch{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}
  @keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.6px)}}
  .crawler{animation:crawl 30s ease-in-out infinite}
  .twitch{transform-box:fill-box;transform-origin:50% 30%;animation:legTwitch .62s ease-in-out infinite}
  .bob{transform-box:fill-box;animation:bob .62s ease-in-out infinite}
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
  <g class="crawler">
    <g transform="translate(70 ${y}) scale(${spiderScale})">
      <g class="bob"><g class="twitch">${spiderMark(0, 0, 1, P.textDim)}</g></g>
    </g>
  </g>`;
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

/* ═══════════════════════════════════════════════════════════════ 4b. ABOUT */
/** Bio + education readout in the same comic-panel style as the rest. */
function aboutPanel() {
  const ed = profile.education;
  const pad = 28;
  const bioTop = 38;
  const lh = TYPE.bodyLh + 3;
  const bio = profile.about
    .map(
      (l, i) =>
        `<text x="${pad}" y="${bioTop + i * lh}" font-size="${TYPE.body}" class="${i === 0 ? 't' : 'dim'}">${esc(l)}</text>`
    )
    .join('');

  const sepY = bioTop + (profile.about.length - 1) * lh + 22;
  const rowY = sepY + 26;
  const rows = [
    ['DEGREE', `${ed.degree} · PICT Pune (SPPU)`, pad, rowY],
    ['YEAR', ed.status.replace(', ', ' · '), pad, rowY + 28],
    ['BASED IN', profile.identity.location, 520, rowY],
    ['SPEAKS', ed.spoken.join(' · '), 520, rowY + 28],
  ]
    .map(
      ([k, v, x, y]) => `
      <text x="${x}" y="${y}" font-size="${TYPE.label}" class="mono red" letter-spacing="1.5">${k}</text>
      <text x="${x + 92}" y="${y}" font-size="${TYPE.body}" class="t">${esc(v)}</text>`
    )
    .join('');

  const tileY = rowY + 56;
  const tileH = 62;
  const gap = 10;
  const n = ed.marks.length;
  const tw = (W - pad * 2 - gap * (n - 1)) / n;
  const tiles = ed.marks
    .map((m, i) => {
      const x = R(pad + i * (tw + gap));
      const hi = i === 0 || m.label === 'MHT-CET';
      return `<g class="tile" style="animation-delay:${i * 80}ms">
        ${panel({ x, y: tileY, w: R(tw), h: tileH, cut: 8, accent: hi ? P.redBright : P.navyLift, fill: P.panelHi })}
        <text x="${R(x + tw / 2)}" y="${tileY + 26}" font-size="19" class="d" fill="${hi ? P.redBright : P.text}" text-anchor="middle">${esc(
          m.value.replace(' / 10', '').replace(' %ile', '').replace(' %', '%')
        )}</text>
        <text x="${R(x + tw / 2)}" y="${tileY + 47}" font-size="9.5" class="faint mono" text-anchor="middle" letter-spacing="1">${esc(
          (m.value.includes('%ile') ? `${m.label} %ile` : m.label).toUpperCase()
        )}</text>
      </g>`;
    })
    .join('');

  const h = tileY + tileH + 24;
  const body = `
  ${panel({ x: 0, y: 0, w: W, h, cut: 18, accent: P.red })}
  ${cornerWeb(W - 1, 1, 70, 1, P.edgeHi, 0.26)}
  ${bio}
  <rect x="${pad}" y="${sepY}" width="${W - pad * 2}" height="1" fill="url(#edgeGrad)" opacity="0.6"/>
  ${rows}
  ${tiles}`;

  return svgDoc({
    w: W,
    h,
    title: 'About',
    desc: `${profile.about.join(' ')} ${ed.degree}, PICT Pune (SPPU), ${ed.status}. Based in ${profile.identity.location}. Speaks ${ed.spoken.join(', ')}. ${ed.marks.map((m) => `${m.label} ${m.value}`).join(', ')}.`,
    css: tileCss,
    body,
    bg: false,
  });
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
      size: TYPE.chip,
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
      size: TYPE.chip,
      delayStep: 45,
    });
    blocks.push(`
      ${panel({ x, y: py, w: colW, h: rowH[row], cut: 14, accent: col ? P.navy : P.red })}
      <text x="${x + 20}" y="${py + 28}" font-size="13" class="d red" letter-spacing="1.4">${esc(
        grp.label.toUpperCase()
      )}</text>
      ${grp.note ? `<text x="${x + colW - 20}" y="${py + 28}" font-size="${TYPE.note}" class="faint" text-anchor="end">${esc(grp.note)}</text>` : ''}
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
/**
 * One SVG per mission so README.md can hang a row of *clickable* repo badges
 * directly underneath each card. A link inside an SVG does nothing once GitHub
 * embeds it through <img>, so anything that has to be clickable is emitted as
 * its own small badge image and wrapped in a Markdown anchor instead.
 */
function missionCard(m, i) {
  /* Compact grid card. Two cards sit side by side in README.md with no
     whitespace between them, each 50% wide, so each SVG is exactly half of
     the 880-unit README width: text renders at the same scale as every
     full-width panel. The 12-unit gutter is built into the SVGs (6 each side
     of the seam), so the outer edges line up with the panels above. */
  const W2 = W / 2;
  const gut = 6;
  const vpad = 4;
  const w = W2 - gut;
  const h = 172;
  const ox = i % 2 ? gut : 0;
  const isWin = m.accent === 'red';
  const accent = isWin ? P.red : P.navy;
  const chipAccent = isWin ? P.edgeHi : P.navyGlow;
  const pad = 20;

  const badgeW = m.badge ? R(textWidth(m.badge, 10) * 1.22 + (isWin ? 46 : 24)) : 0;
  const badge = m.badge
    ? `<rect x="${R(w - pad - badgeW)}" y="16" width="${badgeW}" height="22" rx="11" fill="${
        isWin ? 'url(#redGrad)' : P.navy
      }" stroke="${isWin ? P.redBright : P.navyLift}" stroke-width="1"/>
       ${isWin ? icon('trophy', w - pad - badgeW + 15, 27, 13, '#FFF1EE') : ''}
       <text x="${R(w - pad - badgeW / 2 + (isWin ? 10 : 0))}" y="27.5" font-size="10" class="d" fill="${
        isWin ? '#FFF1EE' : '#D7DEF8'
      }" text-anchor="middle" letter-spacing="1">${esc(m.badge.toUpperCase())}</text>`
    : '';

  const chips = chipRow(m.stack.slice(0, 4), { x: pad, y: 116, maxWidth: w - pad * 2, accent: chipAccent, size: TYPE.chip, delayStep: 40 });
  const ax = w - pad - 6;
  const label = m.repos.length > 1 ? 'view repos' : 'view repo';

  const css = `${chipCss}
  @keyframes mArrow{0%,100%{transform:translate(0,0)}50%{transform:translate(2px,-2px)}}
  .mArrow{animation:mArrow 1.4s ease-in-out infinite;animation-delay:${i * 0.3}s}`;

  const body = `<g transform="translate(${ox} ${vpad})">
  ${panel({ x: 0, y: 0, w, h, cut: 16, accent })}
  ${cornerWeb(1, h - 1, 46, 3, P.edgeHi, 0.22)}
  <text x="${pad}" y="28" font-size="${TYPE.label}" class="mono red" letter-spacing="1.5">${esc(m.code)}</text>
  ${badge}
  <text x="${pad}" y="56" font-size="${TYPE.title}" class="d t">${esc(m.name === 'Streamlit Applications' ? 'StockZ · Sahay' : m.name)}</text>
  ${bodyText(m.short, { x: pad, y: 82, maxWidth: w - pad * 2, size: TYPE.body, lh: TYPE.bodyLh, cls: 'dim' })}
  ${chips.markup}
  <text x="${ax - 14}" y="${h - 18}" font-size="${TYPE.note}" class="faint mono" text-anchor="end">${label}</text>
  <g class="mArrow"><path d="M${ax - 5} ${h - 13} l8 -8 M${ax - 3} ${h - 21} h6 v6" stroke="${P.textDim}" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
  </g>`;

  return svgDoc({
    w: W2,
    h: h + vpad * 2,
    title: `${m.name} — ${m.subtitle}`,
    desc: `${m.code}: ${m.name}. ${m.short} Built with ${m.stack.join(', ')}.`,
    css,
    body,
    bg: false,
  });
}

/* ══════════════════════════════════════════════════════ 6b. LINK BADGES */
/**
 * Small standalone badge image, meant to be wrapped in a Markdown link:
 *   [![alt](readme/btn-x.svg)](https://…)
 * That is the only way to get a clickable, themed control into a README.
 */
function linkBadge({ label, glyph, accent = P.navyGlow, fill = P.panelHi, height = 34 }) {
  const pad = 14;
  const iconBox = 17;
  const tw = textWidth(label, 12.5);
  const w = R(pad + iconBox + 9 + tw + pad);
  const cy = height / 2;

  const css = `
  @keyframes badgeGlow{0%,100%{opacity:.55}50%{opacity:1}}
  .glow{animation:badgeGlow 3.4s ease-in-out infinite}
  `;

  const body = `
  <rect x="0.7" y="0.7" width="${R(w - 1.4)}" height="${height - 1.4}" rx="8" fill="${fill}" stroke="${P.edge}" stroke-width="1.4"/>
  <path d="M8.7 0.7H${R(w - 8)}" stroke="${accent}" stroke-width="2" opacity="0.9"/>
  <g class="glow">${cornerWeb(w - 2.4, 2.4, 19, 1, accent, 0.3)}</g>
  ${icon(glyph, pad + iconBox / 2, cy, iconBox, accent)}
  <text x="${R(pad + iconBox + 9)}" y="${R(cy + 0.5)}" font-size="12.5" class="t">${esc(label)}</text>`;

  return svgDoc({ w, h: height, title: label, css, body, bg: false });
}

/* ════════════════════════════════════════════════════════ 9. ACHIEVEMENTS */
function achievements() {
  const items = profile.achievements;
  const rowH = 88;
  const h = items.length * (rowH + 12) + 8;
  /* one distinct glyph per achievement, each in its own coloured medallion */
  const MEDALLION = {
    win: { glyph: 'trophy', ring: P.redBright, disc: P.red, ink: '#FFF1EE' },
    agent: { glyph: 'agent', ring: P.navyGlow, disc: P.navy, ink: '#D7DEF8' },
    code: { glyph: 'code', ring: P.edgeHi, disc: P.panelHi, ink: '#BFC9E8' },
    globe: { glyph: 'globe', ring: P.navyLift, disc: P.panelHi, ink: '#AEB9DC' },
    score: { glyph: 'score', ring: P.navyGlow, disc: P.navy, ink: '#DCE6FF' },
  };
  const medallion = (kind, x, y) => {
    const m = MEDALLION[kind] || MEDALLION.code;
    return `<g><circle cx="${x}" cy="${y}" r="19" fill="${m.disc}" stroke="${m.ring}" stroke-width="1.4"/>${icon(
      m.glyph,
      x,
      y,
      21,
      m.ink
    )}</g>`;
  };

  const body = items
    .map((a, i) => {
      const y = 4 + i * (rowH + 12);
      return `
      ${panel({ x: 0, y, w: W, h: rowH, cut: 12, accent: a.kind === 'win' ? P.red : P.navy })}
      ${medallion(a.kind, 42, y + rowH / 2)}
      <text x="76" y="${y + 27}" font-size="${TYPE.title}" class="d t">${esc(a.title)}</text>
      ${bodyText(a.detail, { x: 76, y: y + 50, maxWidth: W - 110, size: TYPE.body, lh: TYPE.bodyLh, cls: 'dim' })}`;
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
/**
 * contact-run.svg is the decorative motion strip. Links inside an
 * <img>-embedded SVG are inert on GitHub, so the working controls are four
 * separate button images (contact-<slug>.svg) laid out in one row under the strip,
 * each in its own anchor.
 */
const CONTACT_ROWS = () => [
  { slug: 'mail', glyph: 'mail', text: profile.identity.email, tint: P.redBright },
  { slug: 'github', glyph: 'branch', text: `@${profile.identity.githubHandle}`, tint: P.navyGlow },
  { slug: 'linkedin', glyph: 'linkedin', text: profile.identity.linkedinHandle, tint: P.navyGlow },
];

/**
 * Horizontal motion strip above the contact buttons: the mascot fires a web
 * at an anchor ahead of it, leaps along it, lands, and repeats three times
 * across the width before fading out and starting over.
 */
function contactRun() {
  const h = 210;
  const T = 9; // seconds per loop
  const scale = 0.42;
  const size = MASCOT_VIEWBOX.w * scale; // ~100
  const ground = 192;
  const top = ground - size + 4;
  const step = 240;
  const X = [40, 40 + step, 40 + step * 2, 40 + step * 3];
  // raised right hand, in strip coordinates relative to the mascot's x
  const hand = { x: R(188 * scale), y: R(top + 164 * scale) };

  // leg k: shoot k*30..k*30+10, jump +10..+22, land +22..+30
  const legs = [0, 30, 60];

  const xKeys = [
    `0%,10%{transform:translateX(0)}`,
    `22%,40%{transform:translateX(${step}px)}`,
    `52%,70%{transform:translateX(${step * 2}px)}`,
    `82%,97%{transform:translateX(${step * 3}px)}`,
    `98%,100%{transform:translateX(0)}`,
  ].join('');
  const yKeys = legs
    .map(
      (s) =>
        `${s + 10}%{transform:translateY(0) rotate(0deg);animation-timing-function:cubic-bezier(.25,.7,.45,1)}` +
        `${s + 16}%{transform:translateY(-78px) rotate(-12deg);animation-timing-function:cubic-bezier(.55,0,.75,.3)}` +
        `${s + 22}%{transform:translateY(0) rotate(0deg)}` +
        `${s + 24}%{transform:translateY(3px) scale(1.06,.9)}` +
        `${s + 27}%{transform:translateY(0) scale(1,1)}`
    )
    .join('');
  const armKeys = legs
    .map((s) => `${s + 1}%{transform:rotate(0deg)}${s + 4}%,${s + 12}%{transform:rotate(-52deg)}${s + 16}%{transform:rotate(-20deg)}${s + 20}%{transform:rotate(0deg)}`)
    .join('');

  const webs = [];
  const anchors = [];
  let css = `${mascotCss}${particleCss}
  @keyframes runX{${xKeys}}
  @keyframes runY{0%{transform:translateY(0)}${yKeys}100%{transform:translateY(0)}}
  @keyframes runFade{0%,90%{opacity:1}95%,98%{opacity:0}100%{opacity:1}}
  @keyframes runArm{0%{transform:rotate(0deg)}${armKeys}100%{transform:rotate(0deg)}}
  .runX{animation:runX ${T}s cubic-bezier(.45,.05,.4,1) infinite}
  .runY{transform-box:fill-box;transform-origin:50% 100%;animation:runY ${T}s linear infinite}
  .runFade{animation:runFade ${T}s linear infinite}
  .is-run .wb-arm-r{animation:runArm ${T}s ease-out infinite}
  .is-run .wb-eyes{animation:wb-blink 5.4s ease-in-out infinite}
  .is-run .wb-tail{animation:wb-tailsway 1.4s ease-in-out infinite}
  `;

  legs.forEach((s, k) => {
    const x1 = R(X[k] + hand.x);
    const y1 = hand.y;
    const ax = R(X[k + 1] + size * 0.55);
    const ay = 26;
    const len = R(Math.hypot(ax - x1, ay - y1));
    css += `
  @keyframes web${k}{0%,${s + 2}%{stroke-dashoffset:${len};opacity:1}${s + 8}%{stroke-dashoffset:0;opacity:1}${s + 14}%{stroke-dashoffset:0;opacity:.9}${s + 20}%,100%{stroke-dashoffset:0;opacity:0}}
  .web${k}{stroke-dasharray:${len};stroke-dashoffset:${len};animation:web${k} ${T}s linear infinite}
  @keyframes splat${k}{0%,${s + 7}%{transform:scale(0);opacity:0}${s + 9}%{transform:scale(1.15);opacity:1}${s + 12}%{transform:scale(1);opacity:1}${s + 22}%,100%{transform:scale(1);opacity:0}}
  .splat${k}{transform-box:fill-box;transform-origin:50% 50%;animation:splat${k} ${T}s ease-out infinite;opacity:0}`;
    webs.push(`<path class="web${k}" d="M${x1} ${y1} L${ax} ${ay}" stroke="#EFEAE7" stroke-width="2" stroke-linecap="round" fill="none"/>`);
    anchors.push(`<g class="splat${k}"><path d="${webNet({ cx: ax, cy: ay, radii: [5, 10, 15], spokes: 8, from: -Math.PI, to: Math.PI, sag: 0.8 })}" fill="none" stroke="#EFEAE7" stroke-width="1" opacity="0.85"/><circle cx="${ax}" cy="${ay}" r="2.4" fill="#EFEAE7"/></g>`);
  });

  const ledge = `
  <path d="M0 ${ground + 2} H${W}" stroke="${P.edgeHi}" stroke-width="1.4" opacity="0.7"/>
  <path d="M0 ${ground + 8} H${W}" stroke="${P.edge}" stroke-width="1" opacity="0.6" stroke-dasharray="2 6"/>`;

  const body = `
  ${particles(W, h - 40, 16, 13)}
  ${cornerWeb(W - 2, 2, 110, 1, P.edgeHi, 0.25)}
  ${cornerWeb(2, 2, 80, 0, P.edgeHi, 0.2)}
  ${ledge}
  ${webs.join('')}
  ${anchors.join('')}
  <g class="runFade"><g class="runX"><g class="runY">
    <g class="is-run"><g transform="translate(${X[0]} ${top}) scale(${scale})">${mascotMarkup({ uid: 'run', showTail: true })}</g></g>
  </g></g></g>`;

  return svgDoc({
    w: W,
    h,
    title: 'Web-Byte shooting webs and leaping across the rooftops',
    desc: 'Animated mascot that fires a web at an anchor ahead, leaps along it and lands, three times across the strip.',
    css,
    body,
    bg: false,
  });
}

function contactRow(r, i, n) {
  /* n buttons share one README row with no whitespace between them, each
     100/n % wide, so each SVG is W/n units: same scale as the full-width
     panels, outer edges flush, 12-unit gutters built in at the seams. */
  const w = W / n;
  const gut = 6;
  const left = i === 0 ? 2 : gut;
  const right = i === n - 1 ? 2 : gut;
  const h = 56;
  const ph = 36;
  const px = left;
  const py = (h - ph) / 2;
  const pw = w - left - right;
  const cy = h / 2;
  const red = r.slug === 'mail';
  const ring = red ? P.redBright : P.navyGlow;
  const d = `${i * 0.45}s`;
  const css = `
  @keyframes cRing{0%{transform:scale(1);opacity:.75}70%,100%{transform:scale(1.012,1.3);opacity:0}}
  .cRing{transform-box:fill-box;transform-origin:50% 50%;animation:cRing 2.6s ease-out infinite;animation-delay:${d};opacity:0}
  @keyframes cShine{0%,55%{transform:translateX(0)}100%{transform:translateX(${R(pw + 120)}px)}}
  .cShine{animation:cShine 3.4s ease-in-out infinite;animation-delay:${d}}
  @keyframes cEdge{0%,100%{stroke-opacity:.6}50%{stroke-opacity:1}}
  .cEdge{animation:cEdge 2.6s ease-in-out infinite;animation-delay:${d}}
  @keyframes cArrow{0%,100%{transform:translate(0,0)}50%{transform:translate(2px,-2px)}}
  .cArrow{animation:cArrow 1.3s ease-in-out infinite;animation-delay:${d}}`;
  const defs = `
  <linearGradient id="cFill" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${red ? P.redDeep : P.navyLift}"/>
    <stop offset="1" stop-color="${red ? P.redInk : P.navy}"/>
  </linearGradient>
  <clipPath id="cClip"><rect x="${R(px)}" y="${py}" width="${R(pw)}" height="${ph}" rx="${ph / 2}"/></clipPath>`;
  const ax = R(px + pw - 24);
  const body = `
  <rect class="cRing" x="${R(px)}" y="${py}" width="${R(pw)}" height="${ph}" rx="${ph / 2}" fill="none" stroke="${ring}" stroke-width="2"/>
  <rect x="${R(px)}" y="${py}" width="${R(pw)}" height="${ph}" rx="${ph / 2}" fill="url(#cFill)"/>
  <g clip-path="url(#cClip)"><rect class="cShine" x="${R(px - 70)}" y="${py - 4}" width="40" height="${ph + 8}" fill="#FFFFFF" opacity="0.16" transform="skewX(-20)"/></g>
  <rect class="cEdge" x="${R(px)}" y="${py}" width="${R(pw)}" height="${ph}" rx="${ph / 2}" fill="none" stroke="${ring}" stroke-width="1.5"/>
  ${icon(r.glyph, R(px + 22), cy, 16, '#F1F3FF')}
  <text x="${R(px + 40)}" y="${R(cy + 0.5)}" font-size="13" class="d" fill="#F1F3FF">${esc(r.text)}</text>
  <g class="cArrow"><path d="M${ax - 5} ${cy + 5} l9 -9 M${ax - 3} ${cy - 4} h7 v7" stroke="#F1F3FF" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  return svgDoc({ w: R(w), h, title: r.text, css, defs, body, bg: false });
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
head('sec-achievements.svg', 'ACHIEVEMENTS', 'wall of wins');
head('sec-contact.svg', 'CONTACT', 'open a thread');
write('about.svg', aboutPanel());
write('arsenal.svg', arsenal());

/* one compact card per mission; README.md links each to its repository */
profile.missions.forEach((m, i) => write(`mission-0${i + 1}.svg`, missionCard(m, i)));

write('achievements.svg', achievements());
write('contact-run.svg', contactRun());
CONTACT_ROWS().forEach((r, i, all) => write(`contact-${r.slug}.svg`, contactRow(r, i, all.length)));
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
