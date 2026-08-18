/**
 * Themed profile-view counter panel.
 *
 * Rendered on demand by src/app/api/views/route.ts and embedded in README.md
 * as an image. Because GitHub strips script tags from READMEs, a counter can
 * only ever be an image whose *request* is the thing being counted — so this
 * number is page hits relayed through GitHub's image proxy, not unique humans.
 * The caption says so rather than implying more precision than exists.
 *
 * Sized to sit beside the hanging mascot in README.md and fill that band:
 * 640x260 next to a 132-wide mascot leaves no dead space on a normal README
 * column, and the aspect ratio matches the mascot's rendered height.
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

export const COUNTER_SIZE = { w: 640, h: 260 };

/**
 * @param {object}  opts
 * @param {number|null} opts.count  view count, or null when no store is wired up
 * @param {string}  opts.label      small caps label above the number
 */
export function counterSvg({ count = null, label = 'PROFILE VIEWS' } = {}) {
  const { w, h } = COUNTER_SIZE;
  const cut = 20;

  const shown = count === null ? '—' : Number(count).toLocaleString('en-US');
  const numSize = shown.length > 8 ? 40 : shown.length > 6 ? 48 : shown.length > 4 ? 56 : 64;

  /* ── the web: a real web strung into the right half of the panel ───────── */
  const cx = 452;
  const cy = 128;
  const rings = [24, 48, 74, 100, 126];
  const outer = rings[rings.length - 1];

  // guy-lines pinning the web to the panel, drawn first so the net sits on top
  // No leftward anchor: it would run into the label and number.
  const anchorAngles = [-118, -52, 14, 62, 128];
  const anchors = anchorAngles
    .map((deg) => {
      const a = (deg * Math.PI) / 180;
      const x0 = cx + Math.cos(a) * (outer - 4);
      const y0 = cy + Math.sin(a) * (outer - 4);
      const x1 = cx + Math.cos(a) * 320;
      const y1 = cy + Math.sin(a) * 320;
      return `M${R(x0)} ${R(y0)}L${R(x1)} ${R(y1)}`;
    })
    .join('');

  const web = `
    <g class="anchors"><path d="${anchors}" fill="none" stroke="${P.edge}" stroke-width="1" opacity="0.55" stroke-linecap="round"/></g>
    <g class="dial">
      <path d="${webNet({ cx, cy, radii: rings, spokes: 12, from: -Math.PI, to: Math.PI, sag: 0.86 })}"
            fill="none" stroke="${P.edgeHi}" stroke-width="1" stroke-linecap="round" opacity="0.62"/>
    </g>
    <g class="bug">${spiderMark(cx, cy, 1.9, P.textDim)}</g>`;

  /* ── a smaller spider abseiling off the underline, clear of the caption ── */
  const dropX = 302;
  const abseil = `
    <g class="drop">
      <path d="M${dropX} 162V198" stroke="${P.edge}" stroke-width="1" opacity="0.55" fill="none"/>
      ${spiderMark(dropX, 208, 0.72, P.textFaint)}
    </g>`;

  /* ── a sagging thread underlining the number ──────────────────────────── */
  const rule = `M28 158Q104 168 180 158T${332} 158`;

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
  .dial{transform-box:fill-box;transform-origin:50% 50%;animation:dialSpin 150s linear infinite}
  @keyframes bugBreathe{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}
  .bug{transform-box:fill-box;transform-origin:50% 50%;animation:bugBreathe 3.4s ease-in-out infinite}
  @keyframes abseil{0%,100%{transform:translateY(0)}50%{transform:translateY(14px)}}
  .drop{transform-box:fill-box;transform-origin:50% 0%;animation:abseil 7s ease-in-out infinite}
  @keyframes tick{0%{transform:translateY(6px)}100%{transform:translateY(0)}}
  .num{transform-box:fill-box;animation:tick .6s cubic-bezier(.2,.9,.3,1)}
  @keyframes ember{0%,100%{opacity:.5}50%{opacity:1}}
  .live{animation:ember 2.2s ease-in-out infinite}
  @keyframes shimmer{0%,100%{opacity:.4}50%{opacity:.75}}
  .anchors{animation:shimmer 9s ease-in-out infinite}
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
  <clipPath id="cclip"><path d="${panelPath}"/></clipPath>
</defs>
<style>${css}</style>
<path d="${panelPath}" fill="url(#cbg)" stroke="${P.edge}" stroke-width="1.4"/>
<path d="${panelPath}" fill="url(#chalf)"/>
<g clip-path="url(#cclip)">
  ${abseil}
  ${web}
</g>
<path d="M${cut} 0H${w}" stroke="${P.red}" stroke-width="2.2" fill="none" opacity="0.9"/>
<circle class="live" cx="32" cy="40" r="4.5" fill="${P.redBright}"/>
<text x="48" y="40" font-size="12" class="faint mono" letter-spacing="2.6">${esc(label)}</text>
<g class="num"><text x="28" y="112" font-size="${numSize}" class="d" fill="${P.redBright}">${esc(shown)}</text></g>
<path d="${rule}" fill="none" stroke="${P.edgeHi}" stroke-width="1" opacity="0.6"/>
<text x="28" y="196" font-size="11.5" class="faint">${esc('page hits via GitHub’s image proxy')}</text>
<text x="28" y="215" font-size="11.5" class="faint">${esc('· not unique visitors')}</text>
</svg>`;
}
