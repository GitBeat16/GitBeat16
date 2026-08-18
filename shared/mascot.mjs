/**
 * ORIGINAL mascot: "Web-Byte" — a chubby, short, cat-eared code sprite in a
 * home-made spider suit, built on the same stocky body plan as the profile
 * badge: dominant round head, cat ears, headphones, short wide torso,
 * curled tail, stubby limbs.
 *
 * Inspired by the visual language of comic-book spider heroes (red suit, web
 * lines, big lenses) and by the octo-cat lineage of developer mascots, but
 * drawn from scratch here — no traced or copied art.
 *
 * Authored once, consumed twice:
 *   - src/components/SpiderMascot        (live React prototype)
 *   - scripts/generate-readme-assets.mjs (exported README SVG)
 *
 * viewBox: 0 0 240 240
 */

import { palette as P } from './theme.mjs';

const R = (n, d = 2) => Number(n.toFixed(d));

export const MASCOT_VIEWBOX = { w: 240, h: 240 };

/* ------------------------------------------------------------------ web net */
/** Radial web net: spokes + sagging strands. Used on the mask and the chest. */
export function webNet({ cx, cy, radii = [16, 30, 45, 62], spokes = 10, from = -Math.PI, to = 0, sag = 0.84 }) {
  const a = (i, n) => from + ((to - from) * i) / n;
  const pt = (ang, r) => [R(cx + r * Math.cos(ang)), R(cy + r * Math.sin(ang))];
  const out = [];
  const rMax = radii[radii.length - 1];
  for (let i = 0; i <= spokes; i++) {
    const [x, y] = pt(a(i, spokes), rMax);
    out.push(`M${R(cx)} ${R(cy)}L${x} ${y}`);
  }
  for (const r of radii) {
    for (let i = 0; i < spokes; i++) {
      const a1 = a(i, spokes);
      const a2 = a(i + 1, spokes);
      const am = (a1 + a2) / 2;
      const [x1, y1] = pt(a1, r);
      const [x2, y2] = pt(a2, r);
      const [mx, my] = pt(am, r * sag);
      out.push(`M${x1} ${y1}Q${mx} ${my} ${x2} ${y2}`);
    }
  }
  return out.join('');
}

/* --------------------------------------------------------------- eye lenses */
function lens(cx, cy, w, h, dir, tilt) {
  const pts = [
    [-1.0, 0.34],
    [-0.74, -0.26],
    [-0.24, -0.94],
    [0.28, -0.94],
    [0.64, -0.94],
    [0.95, -0.54],
    [0.95, 0.04],
    [0.95, 0.5],
    [0.52, 0.74],
    [-0.1, 0.72],
    [-0.52, 0.7],
    [-0.9, 0.62],
  ];
  const t = (tilt * Math.PI) / 180;
  const m = ([lx, ly]) => {
    const X = lx * dir * (w / 2);
    const Y = ly * (h / 2);
    return [R(cx + X * Math.cos(t) - Y * Math.sin(t)), R(cy + X * Math.sin(t) + Y * Math.cos(t))];
  };
  const p = pts.map(m);
  return (
    `M${p[0][0]} ${p[0][1]}` +
    `C${p[1][0]} ${p[1][1]} ${p[2][0]} ${p[2][1]} ${p[3][0]} ${p[3][1]}` +
    `C${p[4][0]} ${p[4][1]} ${p[5][0]} ${p[5][1]} ${p[6][0]} ${p[6][1]}` +
    `C${p[7][0]} ${p[7][1]} ${p[8][0]} ${p[8][1]} ${p[9][0]} ${p[9][1]}` +
    `C${p[10][0]} ${p[10][1]} ${p[11][0]} ${p[11][1]} ${p[0][0]} ${p[0][1]}Z`
  );
}

/* ------------------------------------------------------ original spider mark */
/**
 * Deliberately simple, geometric, original spider glyph: rounded two-part body
 * plus eight tapered legs on a symmetric fan. Not a trace of any existing logo.
 */
export function spiderMark(cx, cy, s = 1, color = '#fff') {
  const legs = [];
  for (const base of [-62, -32, -6, 20]) {
    for (const side of [-1, 1]) {
      const a = (base * Math.PI) / 180;
      const x0 = cx + side * 2.4 * s;
      const y0 = cy - 1.5 * s;
      const kx = cx + side * (9 + Math.cos(a) * 2) * s;
      const ky = cy + Math.sin(a) * 9 * s;
      const ex = cx + side * 16 * s;
      const ey = cy + Math.sin(a) * 15 * s + 4 * s;
      legs.push(
        `<path d="M${R(x0)} ${R(y0)}L${R(kx)} ${R(ky)}L${R(ex)} ${R(ey)}" fill="none" stroke="${color}" stroke-width="${R(
          1.5 * s
        )}" stroke-linecap="round" stroke-linejoin="round"/>`
      );
    }
  }
  return `<g class="spider-mark">
    ${legs.join('')}
    <ellipse cx="${R(cx)}" cy="${R(cy - 4.6 * s)}" rx="${R(2.6 * s)}" ry="${R(3.1 * s)}" fill="${color}"/>
    <ellipse cx="${R(cx)}" cy="${R(cy + 3.4 * s)}" rx="${R(3.4 * s)}" ry="${R(6.2 * s)}" fill="${color}"/>
  </g>`;
}

/* --------------------------------------------------------------- the mascot */
const HEAD_PATH =
  'M120 26c30 0 54 12 65 33 8 15 11 33 8 50-3 19-14 33-31 41-12 6-26 9-42 9s-30-3-42-9c-17-8-28-22-31-41-3-17 0-35 8-50 11-21 35-33 65-33Z';

const TORSO_PATH =
  'M120 150c26 0 44 7 47 21 3 12 4 30 3 44-1 10-3 17-7 19H77c-4-2-6-9-7-19-1-14 0-32 3-44 3-14 21-21 47-21Z';

export function mascotMarkup({ uid = 'm', showHeadphones = true, showTail = true } = {}) {
  const g = (n) => `${uid}-${n}`;
  const HEAD_CX = 120;
  const HEAD_CY = 96;

  const defs = `
  <defs>
    <linearGradient id="${g('suitG')}" x1="0" y1="0" x2="0.2" y2="1">
      <stop offset="0" stop-color="#BE3546"/>
      <stop offset="1" stop-color="#8A2130"/>
    </linearGradient>
    <linearGradient id="${g('navy')}" x1="0" y1="0" x2="0.2" y2="1">
      <stop offset="0" stop-color="${P.navyLift}"/>
      <stop offset="1" stop-color="${P.navy}"/>
    </linearGradient>
    <radialGradient id="${g('cheek')}" cx="0.5" cy="0.42" r="0.6">
      <stop offset="0" stop-color="#E15C6D" stop-opacity="0.5"/>
      <stop offset="1" stop-color="#E15C6D" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="${g('neck')}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000000" stop-opacity="0.42"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="${g('headclip')}"><path d="${HEAD_PATH}"/></clipPath>
    <clipPath id="${g('torsoclip')}"><path d="${TORSO_PATH}"/></clipPath>
  </defs>`;

  /* ---- tail: the stocky curled tail from the badge, on the left ---- */
  const tail = showTail
    ? `<g class="wb-tail">
        <path d="M84 202c-16 0-27 6-33 17-5 10-13 14-23 12"
              fill="none" stroke="#9E2A38" stroke-width="14" stroke-linecap="round"/>
      </g>`
    : '';

  /* ---- torso ---- */
  const torso = `
  <g class="wb-torso">
    <path d="${TORSO_PATH}" fill="url(#${g('suitG')})"/>
    <g clip-path="url(#${g('torsoclip')})">
      <path class="wb-web-torso"
            d="${webNet({ cx: 120, cy: 152, radii: [14, 26, 39, 53, 68], spokes: 9, from: 0.16, to: Math.PI - 0.16, sag: 0.86 })}"
            fill="none" stroke="${P.redInk}" stroke-width="1.15" stroke-linecap="round" opacity="0.92"/>
      <rect x="66" y="209" width="108" height="30" fill="${P.navyLift}"/>
      <rect x="66" y="209" width="108" height="2.6" fill="#080C18" opacity="0.5"/>
      <rect x="70" y="146" width="100" height="16" fill="url(#${g('neck')})"/>
    </g>
    ${spiderMark(120, 186, 0.82, '#F4EFEC')}
  </g>`;

  /* ---- stubby arms ---- */
  const arms = `
  <g class="wb-arm wb-arm-l">
    <path d="M78 170C68 173 62 178 58 185" fill="none" stroke="#B3303F" stroke-width="13" stroke-linecap="round"/>
    <circle cx="56" cy="187" r="8" fill="#C8434F"/>
  </g>
  <g class="wb-arm wb-arm-r">
    <path d="M162 170C172 173 178 178 182 185" fill="none" stroke="#B3303F" stroke-width="13" stroke-linecap="round"/>
    <circle cx="184" cy="187" r="8" fill="#C8434F"/>
    <g class="wb-webshot">
      <path d="M190 184 L232 172" stroke="#EFEAE7" stroke-width="2.6" stroke-linecap="round" fill="none"/>
      <circle cx="233" cy="171" r="3.4" fill="#EFEAE7"/>
    </g>
  </g>`;

  /* ---- head ---- */
  const ears = `
  <path d="M72 46 L64 12 L100 34 Z" fill="url(#${g('suitG')})"/>
  <path d="M168 46 L176 12 L140 34 Z" fill="url(#${g('suitG')})"/>`;

  const headphones = showHeadphones
    ? `<g class="wb-cans">
        <path d="M46 92a74 60 0 0 1 148 0" fill="none" stroke="url(#${g('navy')})" stroke-width="11" stroke-linecap="round"/>
        <rect x="30" y="84" width="24" height="46" rx="11" fill="url(#${g('navy')})"/>
        <rect x="186" y="84" width="24" height="46" rx="11" fill="url(#${g('navy')})"/>
      </g>`
    : '';

  const head = `
  <g class="wb-head">
    ${ears}
    <path d="${HEAD_PATH}" fill="url(#${g('suitG')})"/>
    <g clip-path="url(#${g('headclip')})">
      <path class="wb-web-head"
            d="${webNet({ cx: HEAD_CX, cy: HEAD_CY, radii: [16, 30, 46, 64, 84], spokes: 12, from: -Math.PI * 1.04, to: 0.04, sag: 0.85 })}"
            fill="none" stroke="${P.redInk}" stroke-width="1.3" stroke-linecap="round"/>
      <path class="wb-web-head"
            d="${webNet({ cx: HEAD_CX, cy: HEAD_CY, radii: [16, 30, 46, 64, 84], spokes: 12, from: -0.04, to: Math.PI * 1.04, sag: 0.85 })}"
            fill="none" stroke="${P.redInk}" stroke-width="1.3" stroke-linecap="round"/>
      <ellipse cx="82" cy="118" rx="19" ry="11" fill="url(#${g('cheek')})"/>
      <ellipse cx="158" cy="118" rx="19" ry="11" fill="url(#${g('cheek')})"/>
    </g>
    <g class="wb-eyes">
      <path d="${lens(90, 98, 66, 46, -1, 9)}" fill="${P.redInk}"/>
      <path d="${lens(150, 98, 66, 46, 1, -9)}" fill="${P.redInk}"/>
      <path class="wb-lens" d="${lens(90, 98, 55, 34, -1, 9)}" fill="#F6F2EF"/>
      <path class="wb-lens" d="${lens(150, 98, 55, 34, 1, -9)}" fill="#F6F2EF"/>
    </g>
    ${headphones}
  </g>`;

  return `${defs}
  <g class="wb-root">
    ${tail}
    ${torso}
    ${arms}
    ${head}
  </g>`;
}

/* ------------------------------------------------------------ animation CSS */
/**
 * One stylesheet, five states, selected by a class on the <svg> root:
 * is-idle | is-excited | is-webshoot | is-swing | is-hang
 */
export const mascotCss = `
.wb-root{transform-box:fill-box;transform-origin:50% 92%}
.wb-head{transform-box:fill-box;transform-origin:50% 100%}
.wb-eyes{transform-box:fill-box;transform-origin:50% 50%}
.wb-arm-r{transform-box:fill-box;transform-origin:8% 20%}
.wb-tail{transform-box:fill-box;transform-origin:100% 20%}
.wb-webshot{opacity:0}

@keyframes wb-breathe{0%,100%{transform:translateY(0) scale(1,1)}50%{transform:translateY(-1.8px) scale(1.014,0.988)}}
@keyframes wb-nod{0%,100%{transform:rotate(0deg) translateY(0)}30%{transform:rotate(-1.7deg) translateY(-1px)}70%{transform:rotate(1.5deg) translateY(-0.5px)}}
@keyframes wb-blink{0%,92%,100%{transform:scaleY(1)}95%,97%{transform:scaleY(0.08)}}
@keyframes wb-tailsway{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-5deg)}}

@keyframes wb-hop{0%,58%,100%{transform:translateY(0) scaleY(1)}64%{transform:translateY(2px) scaleY(.94)}74%{transform:translateY(-15px) scaleY(1.04)}86%{transform:translateY(-2px) scaleY(.98)}92%{transform:translateY(-6px)}}
@keyframes wb-pop{0%,100%{transform:scale(1)}50%{transform:scale(1.09)}}

@keyframes wb-armraise{0%,20%,100%{transform:rotate(0deg)}35%,74%{transform:rotate(-52deg)}}
@keyframes wb-shoot{0%,32%{opacity:0;transform:scaleX(.1)}40%{opacity:1;transform:scaleX(1.08)}54%{transform:scaleX(1)}80%{opacity:1}100%{opacity:0}}

@keyframes wb-swing{0%,100%{transform:rotate(-12deg)}50%{transform:rotate(12deg)}}
@keyframes wb-swing-lag{0%,100%{transform:rotate(6deg)}50%{transform:rotate(-6deg)}}

/* ---------- IDLE ---------- */
.is-idle .wb-root{animation:wb-breathe 3.6s ease-in-out infinite}
.is-idle .wb-head{animation:wb-nod 7.2s ease-in-out infinite}
.is-idle .wb-eyes{animation:wb-blink 5.4s ease-in-out infinite}
.is-idle .wb-tail{animation:wb-tailsway 4.4s ease-in-out infinite}

/* ---------- EXCITED ---------- */
.is-excited .wb-root{animation:wb-hop 1.2s cubic-bezier(.3,.9,.3,1) infinite}
.is-excited .wb-eyes{animation:wb-pop 1.2s ease-in-out infinite}
.is-excited .wb-tail{animation:wb-tailsway 1s ease-in-out infinite}

/* ---------- WEB SHOOT ---------- */
.is-webshoot .wb-root{animation:wb-breathe 3.6s ease-in-out infinite}
.is-webshoot .wb-arm-r{animation:wb-armraise 2.6s cubic-bezier(.3,.8,.3,1) infinite}
.is-webshoot .wb-webshot{animation:wb-shoot 2.6s ease-out infinite;transform-box:fill-box;transform-origin:0% 50%}
.is-webshoot .wb-eyes{animation:wb-blink 5.4s ease-in-out infinite}
.is-webshoot .wb-tail{animation:wb-tailsway 4.4s ease-in-out infinite}

/* ---------- SWING / HANG ---------- */
.is-swing .wb-root{animation:wb-swing 3.2s ease-in-out infinite;transform-origin:50% -30%}
.is-swing .wb-tail{animation:wb-swing-lag 3.2s ease-in-out infinite}
.is-swing .wb-eyes{animation:wb-blink 6.6s ease-in-out infinite}

.is-hang .wb-root{animation:wb-swing 4.8s ease-in-out infinite;transform-origin:50% -55%}
.is-hang .wb-tail{animation:wb-swing-lag 4.8s ease-in-out infinite}
.is-hang .wb-eyes{animation:wb-blink 6.2s ease-in-out infinite}

@media (prefers-reduced-motion: reduce){
  .wb-root,.wb-head,.wb-eyes,.wb-arm-r,.wb-webshot,.wb-tail{animation:none !important}
}
`;
