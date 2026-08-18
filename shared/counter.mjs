/**
 * Themed profile-view counter panel.
 *
 * Rendered on demand by src/app/api/views/route.ts and embedded in README.md
 * as an <img>. Because GitHub strips <script> from READMEs, a counter can only
 * ever be an image whose *request* is the thing being counted — so this number
 * is page hits relayed through GitHub's image proxy, not unique humans. The
 * caption on the panel says so rather than implying more precision than exists.
 *
 * Shares shared/theme.mjs with every other asset so it can never drift from
 * the rest of the profile's palette.
 */

import { palette as P, font as F } from './theme.mjs';
import { webNet, spiderMark } from './mascot.mjs';

const R = (n, d = 2) => Number(Number(n).toFixed(d));

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Rough advance width for the web-safe sans stack (mirrors scripts/lib/render.mjs). */
const NARROW = new Set([...'ijl.,:;!|\'`I()[]{}/\\ ']);
const WIDE = new Set([...'MWmw@%']);
function textWidth(str, size) {
  let u = 0;
  for (const ch of String(str)) u += NARROW.has(ch) ? 0.34 : WIDE.has(ch) ? 0.92 : 0.55;
  return u * size;
}

export const COUNTER_SIZE = { w: 440, h: 150 };

/**
 * @param {object}  opts
 * @param {number|null} opts.count  view count, or null when no store is wired up
 * @param {string}  opts.label      small caps label above the number
 */
export function counterSvg({ count = null, label = 'PROFILE VIEWS' } = {}) {
  const { w, h } = COUNTER_SIZE;
  const cut = 18;

  const shown = count === null ? '—' : Number(count).toLocaleString('en-US');
  const numSize = shown.length > 7 ? 34 : shown.length > 5 ? 40 : 46;

  // web dial on the right-hand side, with the mascot's spider sat in the middle
  const dialX = 344;
  const dialY = h / 2;
  const dial = `
    <g class="dial">
      <path d="${webNet({
        cx: dialX,
        cy: dialY,
        radii: [16, 30, 44, 56],
        spokes: 10,
        from: -Math.PI,
        to: Math.PI,
        sag: 0.86,
      })}" fill="none" stroke="${P.edgeHi}" stroke-width="1" stroke-linecap="round" opacity="0.7"/>
    </g>
    <g class="bug">${spiderMark(dialX, dialY, 1.05, P.textDim)}</g>`;

  const panelPath = `M${cut} 0H${w}V${h - cut}L${w - cut} ${h}H0V${cut}Z`;

  const css = `
  text{font-family:${F.body};dominant-baseline:middle}
  .d{font-family:${F.display};font-weight:700;letter-spacing:.5px}
  .mono{font-family:${F.mono}}
  .dim{fill:${P.textDim}}
  .faint{fill:${P.textFaint}}
  /* Motion is additive only: every element renders at its base style with the
     animation stripped, so nothing can get stuck invisible once embedded.
     Never put a raw angle bracket in here — this stylesheet is inlined into XML. */
  @keyframes dialSpin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}
  .dial{transform-box:fill-box;transform-origin:50% 50%;animation:dialSpin 120s linear infinite}
  @keyframes bugBreathe{0%,100%{transform:scale(1)}50%{transform:scale(1.09)}}
  .bug{transform-box:fill-box;transform-origin:50% 50%;animation:bugBreathe 3.4s ease-in-out infinite}
  @keyframes tick{0%{transform:translateY(5px)}100%{transform:translateY(0)}}
  .num{transform-box:fill-box;animation:tick .6s cubic-bezier(.2,.9,.3,1)}
  @keyframes ember{0%,100%{opacity:.55}50%{opacity:1}}
  .live{animation:ember 2.2s ease-in-out infinite}
  @media (prefers-reduced-motion: reduce){*{animation:none !important}}
  `;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(
    `${label}: ${shown}`
  )}" preserveAspectRatio="xMidYMid meet">
<title>${esc(`${label}: ${shown}`)}</title>
<desc>${esc(
    `Spider-web styled counter panel showing ${shown} ${label.toLowerCase()}, counted through GitHub's image proxy.`
  )}</desc>
<defs>
  <linearGradient id="cbg" x1="0" y1="0" x2="0.4" y2="1">
    <stop offset="0" stop-color="#0C0F1B"/>
    <stop offset="0.55" stop-color="${P.bg}"/>
    <stop offset="1" stop-color="${P.void}"/>
  </linearGradient>
  <pattern id="chalf" width="6" height="6" patternUnits="userSpaceOnUse">
    <circle cx="1.5" cy="1.5" r="0.75" fill="#FFFFFF" fill-opacity="0.035"/>
    <circle cx="4.5" cy="4.5" r="0.75" fill="#FFFFFF" fill-opacity="0.02"/>
  </pattern>
</defs>
<style>${css}</style>
<path d="${panelPath}" fill="url(#cbg)" stroke="${P.edge}" stroke-width="1.4"/>
<path d="${panelPath}" fill="url(#chalf)"/>
<path d="M${cut} 0H${w}" stroke="${P.red}" stroke-width="2.2" fill="none" opacity="0.9"/>
${dial}
<circle class="live" cx="30" cy="34" r="4" fill="${P.redBright}"/>
<text x="44" y="34" font-size="11" class="faint mono" letter-spacing="2.4">${esc(label)}</text>
<g class="num"><text x="28" y="82" font-size="${numSize}" class="d" fill="${P.redBright}">${esc(shown)}</text></g>
<text x="28" y="118" font-size="10.5" class="faint">${esc(
    'page hits via GitHub’s image proxy · not unique visitors'
  )}</text>
</svg>`;
}
