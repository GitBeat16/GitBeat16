/**
 * Shared SVG building blocks for the exported README assets.
 * Everything here emits plain strings — no DOM, no browser.
 *
 * GitHub renders README SVGs through an <img> tag, which means:
 *   - CSS animation and SMIL DO run
 *   - <script> is stripped (we never use it)
 *   - external fonts do NOT load (we use web-safe stacks only)
 */

import { palette as P, font as F } from '../../shared/theme.mjs';

export const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const R = (n, d = 2) => Number(Number(n).toFixed(d));

/* --------------------------------------------------------------- document */
export function svgDoc({ w, h, title, desc = '', css = '', defs = '', body, bg = true }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(
    title
  )}" preserveAspectRatio="xMidYMid meet">
<title>${esc(title)}</title>${desc ? `\n<desc>${esc(desc)}</desc>` : ''}
<defs>${commonDefs()}${defs}</defs>
<style>${baseCss()}${css}</style>
${bg ? `<rect width="${w}" height="${h}" rx="16" fill="url(#bgGrad)"/><rect width="${w}" height="${h}" rx="16" fill="url(#halftone)" opacity="0.5"/>` : ''}
${body}
</svg>`;
}

export function commonDefs() {
  return `
  <linearGradient id="bgGrad" x1="0" y1="0" x2="0.4" y2="1">
    <stop offset="0" stop-color="#0C0F1B"/>
    <stop offset="0.55" stop-color="${P.bg}"/>
    <stop offset="1" stop-color="${P.void}"/>
  </linearGradient>
  <linearGradient id="redGrad" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${P.redBright}"/>
    <stop offset="1" stop-color="${P.red}"/>
  </linearGradient>
  <linearGradient id="navyGrad" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${P.navyGlow}"/>
    <stop offset="1" stop-color="${P.navy}"/>
  </linearGradient>
  <linearGradient id="edgeGrad" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${P.red}" stop-opacity="0.9"/>
    <stop offset="0.5" stop-color="${P.edgeHi}" stop-opacity="0.55"/>
    <stop offset="1" stop-color="${P.navy}" stop-opacity="0.9"/>
  </linearGradient>
  <pattern id="halftone" width="6" height="6" patternUnits="userSpaceOnUse">
    <circle cx="1.5" cy="1.5" r="0.75" fill="#FFFFFF" fill-opacity="0.035"/>
    <circle cx="4.5" cy="4.5" r="0.75" fill="#FFFFFF" fill-opacity="0.02"/>
  </pattern>
  <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
    <feGaussianBlur stdDeviation="3.2" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="tinyGlow" x="-60%" y="-60%" width="220%" height="220%">
    <feGaussianBlur stdDeviation="1.6" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>`;
}

export function baseCss() {
  return `
  text{font-family:${F.body};dominant-baseline:middle}
  .d{font-family:${F.display};font-weight:700;letter-spacing:0.5px}
  .mono{font-family:${F.mono}}
  .t{fill:${P.text}}
  .dim{fill:${P.textDim}}
  .faint{fill:${P.textFaint}}
  .red{fill:${P.redBright}}
  @media (prefers-reduced-motion: reduce){*{animation:none !important}}
  `;
}

/* ------------------------------------------------------------ comic panel */
/** Comic panel with a clipped corner, thin double border and halftone fill. */
export function panel({ x, y, w, h, cut = 16, accent = P.red, fill = P.panel, opacity = 1 }) {
  const d = `M${x + cut} ${y}H${x + w}V${y + h - cut}L${x + w - cut} ${y + h}H${x}V${y + cut}Z`;
  return `<g opacity="${opacity}">
    <path d="${d}" fill="${fill}" stroke="${P.edge}" stroke-width="1.4"/>
    <path d="${d}" fill="url(#halftone)"/>
    <path d="M${x + cut} ${y}H${x + w}" stroke="${accent}" stroke-width="2.2" fill="none" opacity="0.9"/>
  </g>`;
}

/* -------------------------------------------------------------- web bits */
/** A hanging web strand with a small zig-zag texture. */
export function strand(x, y0, y1, { w = 1.3, color = P.textFaint, ticks = true } = {}) {
  const t = [];
  if (ticks) {
    for (let y = y0 + 10; y < y1 - 6; y += 14) {
      t.push(`M${x - 3} ${R(y)}L${x + 3} ${R(y + 4)}`);
    }
  }
  return `<g stroke="${color}" fill="none" stroke-linecap="round">
    <path d="M${x} ${y0}V${y1}" stroke-width="${w}"/>
    ${t.length ? `<path d="${t.join('')}" stroke-width="${w * 0.7}" opacity="0.55"/>` : ''}
  </g>`;
}

/** Corner web: quarter net anchored in a corner. */
export function cornerWeb(cx, cy, r, quadrant = 0, color = P.edgeHi, opacity = 0.5) {
  const from = (quadrant * Math.PI) / 2;
  const to = from + Math.PI / 2;
  const spokes = 5;
  const radii = [r * 0.28, r * 0.5, r * 0.72, r];
  const pt = (a, rr) => [R(cx + rr * Math.cos(a)), R(cy + rr * Math.sin(a))];
  const parts = [];
  for (let i = 0; i <= spokes; i++) {
    const a = from + ((to - from) * i) / spokes;
    const [x, y] = pt(a, r);
    parts.push(`M${R(cx)} ${R(cy)}L${x} ${y}`);
  }
  for (const rr of radii) {
    for (let i = 0; i < spokes; i++) {
      const a1 = from + ((to - from) * i) / spokes;
      const a2 = from + ((to - from) * (i + 1)) / spokes;
      const am = (a1 + a2) / 2;
      const [x1, y1] = pt(a1, rr);
      const [x2, y2] = pt(a2, rr);
      const [mx, my] = pt(am, rr * 0.86);
      parts.push(`M${x1} ${y1}Q${mx} ${my} ${x2} ${y2}`);
    }
  }
  return `<path d="${parts.join('')}" fill="none" stroke="${color}" stroke-width="1" opacity="${opacity}" stroke-linecap="round"/>`;
}

/* ------------------------------------------------------------- city line */
/**
 * Deterministic skyline. Same seed -> same city, so regenerating assets
 * never produces a spurious diff.
 */
export function skyline({ x, y, w, h, seed = 7, windows = true, glow = true }) {
  let s = seed;
  const rnd = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);

  const buildings = [];
  const wins = [];
  let cx = x - 10;
  let i = 0;
  while (cx < x + w) {
    const bw = 26 + Math.round(rnd() * 46);
    const bh = 30 + Math.round(rnd() * (h - 34));
    const by = y + h - bh;
    buildings.push(`<rect x="${R(cx)}" y="${R(by)}" width="${bw}" height="${bh}" fill="#080A13"/>`);
    // antenna
    if (rnd() > 0.68) {
      const ax = R(cx + bw / 2);
      buildings.push(`<path d="M${ax} ${R(by)}V${R(by - 10 - rnd() * 10)}" stroke="#080A13" stroke-width="2.4"/>`);
    }
    if (windows) {
      for (let wy = by + 8; wy < y + h - 8; wy += 11) {
        for (let wx = cx + 6; wx < cx + bw - 8; wx += 10) {
          const r = rnd();
          if (r > 0.62) {
            const c = r > 0.9 ? P.redBright : r > 0.78 ? P.navyGlow : '#2A3352';
            // Most windows blink; the phase bucket is derived from the seeded
            // stream so the city twinkles irregularly instead of in lockstep.
            const lit = glow && r > 0.68;
            wins.push(
              `<rect class="${lit ? `win w${i % 8}` : ''}" x="${R(wx)}" y="${R(wy)}" width="5" height="4" rx="1" fill="${c}" opacity="${
                lit ? 0.85 : 0.5
              }"/>`
            );
            i++;
          }
        }
      }
    }
    cx += bw + 3 + Math.round(rnd() * 7);
  }
  return `<g class="skyline">${buildings.join('')}${wins.join('')}</g>`;
}

export const skylineCss = `
@keyframes winPulse{0%,100%{opacity:.16}42%{opacity:1}58%{opacity:.9}}
.win{animation:winPulse 3.6s ease-in-out infinite}
.w0{animation-delay:0s}.w1{animation-delay:.45s}.w2{animation-delay:.9s}.w3{animation-delay:1.35s}
.w4{animation-delay:1.8s}.w5{animation-delay:2.25s}.w6{animation-delay:2.7s}.w7{animation-delay:3.15s}
.w1{animation-duration:4.4s}.w3{animation-duration:2.9s}.w5{animation-duration:5.1s}.w7{animation-duration:3.2s}
`;

/* ----------------------------------------------------------- text helpers */
/** Rough advance-width table good enough for layout of a sans stack. */
const NARROW = new Set([...'ijl.,:;!|\'`I()[]{}/\\ ']);
const WIDE = new Set([...'MWmw@%']);
export function textWidth(str, size) {
  let u = 0;
  for (const ch of String(str)) u += NARROW.has(ch) ? 0.34 : WIDE.has(ch) ? 0.92 : 0.55;
  return u * size;
}

export function wrap(text, maxWidth, size) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (textWidth(next, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

export function paragraph(text, { x, y, maxWidth, size = 13, lh = 19, cls = 'dim', anchor = 'start' }) {
  return wrap(text, maxWidth, size)
    .map(
      (l, i) =>
        `<text x="${x}" y="${R(y + i * lh)}" font-size="${size}" class="${cls}" text-anchor="${anchor}">${esc(l)}</text>`
    )
    .join('');
}

/* ------------------------------------------------------------------ chips */
export function chip(label, x, y, { size = 12, accent = P.edgeHi, fill = '#151B31', delay = 0 } = {}) {
  const w = R(textWidth(label, size) + 22);
  const h = 24;
  return {
    w,
    markup: `<g class="chip" style="animation-delay:${delay}ms">
      <rect x="${R(x)}" y="${R(y)}" width="${w}" height="${h}" rx="7" fill="${fill}" stroke="${accent}" stroke-width="1"/>
      <text x="${R(x + w / 2)}" y="${R(y + h / 2 + 0.5)}" font-size="${size}" class="t" text-anchor="middle">${esc(label)}</text>
    </g>`,
  };
}

export const chipCss = `
/* Motion is purely additive: no fill-mode, so before and after the animation
   the element renders at its base style. Content is never hidden by a delay,
   by an offscreen-throttled image, or by prefers-reduced-motion.
   (Never put a raw angle bracket in here: this stylesheet is inlined into XML.) */
@keyframes chipIn{0%{transform:translateY(7px) scale(.98)}100%{transform:translateY(0) scale(1)}}
.chip{transform-box:fill-box;transform-origin:50% 50%;animation:chipIn .5s ease-out}
`;

/** Lay chips out on wrapping rows; returns {markup, height}. */
export function chipRow(labels, { x, y, maxWidth, gap = 8, rowH = 32, accent, size = 12, delayStep = 55 }) {
  let cx = x;
  let cy = y;
  const out = [];
  labels.forEach((label, i) => {
    const c = chip(label, cx, cy, { accent, size, delay: i * delayStep });
    if (cx + c.w > x + maxWidth && cx > x) {
      cx = x;
      cy += rowH;
      out.push(chip(label, cx, cy, { accent, size, delay: i * delayStep }).markup);
      cx += c.w + gap;
    } else {
      out.push(c.markup);
      cx += c.w + gap;
    }
  });
  return { markup: out.join(''), height: cy - y + rowH };
}
