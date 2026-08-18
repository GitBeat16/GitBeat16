/** High-level composed pieces shared by several exported assets. */

import { palette as P, font as F } from '../../shared/theme.mjs';
import { esc, R, panel, cornerWeb, textWidth, wrap } from './render.mjs';

/** Comic-tag section header: skewed red slab + title + trailing web strand. */
export function sectionHeader({ w, title, kicker = '', h = 60 }) {
  const size = 24;
  const tw = textWidth(title, size);
  const slabW = R(tw * 1.28 + 54);
  const skew = 12;
  const y = 10;
  const bh = 38;

  return `
  <g class="hdr">
    <path d="M${skew} ${y} H${slabW + skew} L${slabW} ${y + bh} H0 Z" fill="url(#redGrad)"/>
    <path d="M${skew} ${y} H${slabW + skew} L${slabW} ${y + bh} H0 Z" fill="url(#halftone)"/>
    <text x="${R(slabW / 2 + 4)}" y="${R(y + bh / 2 + 1)}" font-size="${size}" class="d" fill="#FFF3F1" text-anchor="middle">${esc(
      title
    )}</text>
    ${
      kicker
        ? `<text x="${R(slabW + 26)}" y="${R(y + bh / 2 + 1)}" font-size="12" class="faint mono">${esc(kicker)}</text>`
        : ''
    }
    <path class="hdrline" d="M${R(slabW + 26 + (kicker ? textWidth(kicker, 12) + 16 : 0))} ${R(y + bh / 2)} H${w - 4}"
          stroke="url(#edgeGrad)" stroke-width="1.6" fill="none"/>
    <circle cx="${w - 4}" cy="${R(y + bh / 2)}" r="3" fill="${P.redBright}"/>
  </g>`;
}

export const headerCss = `
@keyframes hdrIn{0%{transform:translateX(-12px)}100%{transform:translateX(0)}}
.hdr{transform-box:fill-box;animation:hdrIn .6s ease-out}
@keyframes lineDraw{0%{stroke-dasharray:0 999}100%{stroke-dasharray:999 0}}
.hdrline{animation:lineDraw 1.1s ease-out}
`;

/** Small stat tile. */
export function statTile({ x, y, w, h, value, label, accent = P.redBright, delay = 0 }) {
  return `<g class="tile" style="animation-delay:${delay}ms">
    ${panel({ x, y, w, h, cut: 10, accent, fill: P.panelHi })}
    <text x="${R(x + w / 2)}" y="${R(y + h * 0.42)}" font-size="26" class="d" fill="${accent}" text-anchor="middle">${esc(
      value
    )}</text>
    <text x="${R(x + w / 2)}" y="${R(y + h * 0.74)}" font-size="11" class="faint" text-anchor="middle" letter-spacing="1">${esc(
      label
    )}</text>
  </g>`;
}

export const tileCss = `
@keyframes tileIn{0%{transform:translateY(11px) scale(.985)}100%{transform:translateY(0) scale(1)}}
.tile{animation:tileIn .55s ease-out;transform-box:fill-box}
`;

/** Comic speech bubble with a tail. */
export function speechBubble({ x, y, text, size = 20, tail = 'bl', accent = P.red }) {
  const padX = 22;
  const padY = 14;
  const w = R(textWidth(text, size) + padX * 2);
  const h = R(size + padY * 2);
  const rx = h / 2;
  const tailPath =
    tail === 'bl'
      ? `M${R(x + w * 0.24)} ${R(y + h - 4)} l-6 20 l22 -14 Z`
      : `M${R(x + w * 0.76)} ${R(y + h - 4)} l6 20 l-22 -14 Z`;
  return `<g class="bubble">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${accent}"/>
    <path d="${tailPath}" fill="${accent}"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="url(#halftone)"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="none" stroke="#1A0A0F" stroke-width="2.4"/>
    <path d="${tailPath}" fill="none" stroke="#1A0A0F" stroke-width="2.4" stroke-linejoin="round"/>
    <text x="${R(x + w / 2)}" y="${R(y + h / 2 + 1)}" font-size="${size}" class="d" fill="#FFF6F4" text-anchor="middle">${esc(
      text
    )}</text>
  </g>`;
}

export const bubbleCss = `
@keyframes bubblePop{0%{transform:scale(.88) rotate(-4deg)}60%{transform:scale(1.05) rotate(1.5deg)}100%{transform:scale(1) rotate(0deg)}}
.bubble{transform-box:fill-box;transform-origin:30% 100%;animation:bubblePop .7s cubic-bezier(.3,1.2,.4,1)}
`;

/** Floating dust/particles for depth. */
export function particles(w, h, n = 18, seed = 3) {
  let s = seed;
  const rnd = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  const out = [];
  for (let i = 0; i < n; i++) {
    const x = R(rnd() * w);
    const y = R(rnd() * h);
    const r = R(0.7 + rnd() * 1.5);
    const c = rnd() > 0.6 ? P.redBright : P.navyGlow;
    out.push(
      `<circle class="pt p${i % 6}" cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity="${R(0.15 + rnd() * 0.35)}"/>`
    );
  }
  return out.join('');
}

export const particleCss = `
@keyframes drift{0%{transform:translateY(0)}50%{transform:translateY(-9px)}100%{transform:translateY(0)}}
.pt{animation:drift 9s ease-in-out infinite}
.p0{animation-delay:0s}.p1{animation-delay:1.4s}.p2{animation-delay:2.8s}
.p3{animation-delay:4.2s}.p4{animation-delay:5.6s}.p5{animation-delay:7s}
`;

/** Multi-line body copy inside a panel. */
export function bodyText(text, { x, y, maxWidth, size = 13, lh = 20, cls = 'dim' }) {
  return wrap(text, maxWidth, size)
    .map((l, i) => `<text x="${x}" y="${R(y + i * lh)}" font-size="${size}" class="${cls}">${esc(l)}</text>`)
    .join('');
}

export { P, F };
