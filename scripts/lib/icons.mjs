/**
 * Line-art icon set for the exported README assets.
 *
 * Every icon is authored inside a 24x24 box centred on (0,0) — i.e. it draws
 * between -12 and +12 on both axes — so `icon(name, x, y, size)` can place it
 * by its centre without any per-icon fudge factors.
 *
 * The shapes are drawn here rather than pulled from an icon font because the
 * exported SVGs are embedded by GitHub through <img>: no external font, no
 * external sprite sheet and no <script> survives that path.
 */

import { palette as P } from '../../shared/theme.mjs';

const S = (d, color, w = 1.9, extra = '') =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;

const F = (d, color) => `<path d="${d}" fill="${color}"/>`;

/** name -> markup(color) drawn in the centred 24x24 box. */
const SHAPES = {
  /* ── contact ─────────────────────────────────────────────────────────── */
  mail: (c) => `
    ${S('M-10.5 -7.5h21v15h-21z', c)}
    ${S('M-10.5 -6.5 0 1.5 10.5 -6.5', c)}`,

  /** git-branch mark — reads as "source repository" without borrowing a logo. */
  branch: (c) => `
    ${S('M-5.5 -5.5V5.5', c)}
    ${S('M5.5 -3.2V-1C5.5 3.4 1.5 3 -5.5 4', c)}
    ${F('M-5.5 -9.6a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z', c)}
    ${F('M-5.5 3.6a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z', c)}
    ${F('M5.5 -9.6a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z', c)}`,

  /** LinkedIn-style "in" glyph, hand-drawn from primitives. */
  linkedin: (c) => `
    ${S('M-10.5 -10.5h21v21h-21z', c, 1.7)}
    ${F('M-6.6 -6.6a1.9 1.9 0 1 1 0 3.8 1.9 1.9 0 0 1 0-3.8Z', c)}
    ${F('M-8.2 -1.2h3.2v8.6h-3.2z', c)}
    ${F('M-2 -1.2h3.1v1.3a3.5 3.5 0 0 1 6.3 2.2v5.1h-3.2v-4.5a1.6 1.6 0 0 0-3.2 0v4.5h-3z', c)}`,

  pin: (c) => `
    ${S('M0 10.5C-4.6 4.6 -7 1.6 -7 -1.6a7 7 0 0 1 14 0c0 3.2 -2.4 6.2 -7 12.1Z', c)}
    ${S('M0 -4.2a2.6 2.6 0 1 1 0 5.2 2.6 2.6 0 0 1 0-5.2Z', c)}`,

  /* ── achievements ────────────────────────────────────────────────────── */
  trophy: (c) => `
    ${S('M-6 -8.5h12v4.5a6 6 0 0 1 -12 0Z', c)}
    ${S('M-6 -6.6h-3.4v1.8a3.6 3.6 0 0 0 3.4 3.6', c, 1.6)}
    ${S('M6 -6.6h3.4v1.8a3.6 3.6 0 0 1 -3.4 3.6', c, 1.6)}
    ${S('M0 1.6v4.2', c)}
    ${S('M-4.4 8.8h8.8', c)}
    ${S('M-2.6 5.8h5.2v3h-5.2Z', c, 1.6)}`,

  /** Boardroom of agents: a decision node with satellites voting into it. */
  agent: (c) => `
    ${S('M0 -3.6a3.6 3.6 0 1 1 0 7.2 3.6 3.6 0 0 1 0-7.2Z', c)}
    ${S('M0 -3.6V-8.4M-3.1 1.8 -7.4 4.6M3.1 1.8 7.4 4.6', c, 1.5)}
    ${F('M0 -11.4a2.4 2.4 0 1 1 0 4.8 2.4 2.4 0 0 1 0-4.8Z', c)}
    ${F('M-9.2 3.6a2.4 2.4 0 1 1 0 4.8 2.4 2.4 0 0 1 0-4.8Z', c)}
    ${F('M9.2 3.6a2.4 2.4 0 1 1 0 4.8 2.4 2.4 0 0 1 0-4.8Z', c)}`,

  code: (c) => `
    ${S('M-3.6 -8.4 -10.4 0 -3.6 8.4', c)}
    ${S('M3.6 -8.4 10.4 0 3.6 8.4', c)}
    ${S('M1.4 -8.8 -1.4 8.8', c, 1.6)}`,

  globe: (c) => `
    ${S('M0 -10.4a10.4 10.4 0 1 1 0 20.8 10.4 10.4 0 0 1 0-20.8Z', c)}
    ${S('M-10.2 -2.6h20.4M-10.2 2.6h20.4', c, 1.5)}
    ${S('M0 -10.4c3.6 3.4 3.6 17.4 0 20.8c-3.6 -3.4 -3.6 -17.4 0 -20.8Z', c, 1.5)}`,

  score: (c) => `
    ${S('M-9 5.5 -3.4 -3 0.6 1.6 9 -7.4', c)}
    ${S('M4.2 -7.4h4.8v4.8', c, 1.6)}`,
};

export const ICON_NAMES = Object.keys(SHAPES);

/**
 * Place an icon by its centre.
 * @param {string} name  key from SHAPES
 * @param {number} x     centre x
 * @param {number} y     centre y
 * @param {number} size  edge length of the icon box (24 = authored size)
 */
export function icon(name, x, y, size = 24, color = P.text) {
  const shape = SHAPES[name] || SHAPES.branch;
  const s = size / 24;
  return `<g transform="translate(${x} ${y}) scale(${Number(s.toFixed(4))})">${shape(color)}</g>`;
}
