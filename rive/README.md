# Rive mascot — authoring contract

## Why this folder has a spec instead of a `.riv`

`.riv` is Rive's compiled binary format. It is produced by the Rive editor
(rive.app) — there is no public SDK or CLI that can author or compile one
programmatically, so a `.riv` cannot be generated from a script the way the SVGs
in `readme/` are. What ships here instead is:

- **`src/components/SpiderMascot/RiveMascot.tsx`** — the Rive runtime
  integration, already wired to `@rive-app/react-canvas`. It looks for
  `public/rive/web-byte.riv` and drives it through the state machine below.
- **`src/components/SpiderMascot/MascotSvg.tsx`** — a fully working SVG
  renderer that implements the *same five states*. It is what runs today, and
  what the exported README assets are rendered from.

Drop a `web-byte.riv` matching the contract below into `public/rive/` and
`RiveMascot` switches to it automatically — no other code changes.

## Artboard

| property | value |
| --- | --- |
| Artboard name | `WebByte` |
| Size | `240 × 240` (matches `MASCOT_VIEWBOX` in `shared/mascot.mjs`) |
| Origin | top-left |

Trace the shapes straight from `readme/mascot.svg` — importing that SVG into
Rive gives you the correct proportions, palette and layer names in one step.

## Rig

| bone / group | notes |
| --- | --- |
| `root` | whole character; parent of everything. Pivot at 50% / 92% |
| `head` | head + ears + headphones. Pivot at the neck (50% / 100%) |
| `eyes` | both lens groups; scale-Y for blinks |
| `armR` | right arm + hand. Pivot at the shoulder |
| `armL` | left arm + hand |
| `tail` | curled tail. Pivot where it meets the torso |
| `webShot` | the projected strand + tip, hidden by default |

## State machine — `Mascot`

Inputs (all **triggers** except where noted):

| input | type | meaning |
| --- | --- | --- |
| `Idle` | trigger | return to the ambient loop |
| `Excited` | trigger | one hop + eye pop, then auto-return |
| `WebShoot` | trigger | raise arm, fire strand, recoil, auto-return |
| `Swing` | trigger | ambient swing loop |
| `Hang` | trigger | ambient hang loop |

States and the animations they play:

```
        ┌──────────────────────────── Idle ◀────────────────────────┐
        │                              │                            │
   Excited ──(exit time 1.2s)──────────┤                            │
        │                              │                            │
  WebShoot ──(exit time 2.6s)──────────┤                            │
                                       ├──▶ Swing ──(Idle)──────────┤
                                       └──▶ Hang  ──(Idle)──────────┘
```

| animation | length | loop | contents |
| --- | --- | --- | --- |
| `idle` | 3.6 s | loop | `root` breathe ±1.8 px, `head` nod ±1.7°, `tail` sway −5° |
| `blink` | 5.4 s | loop | `eyes` scale-Y 1 → 0.08 → 1 over 2 frames near the end |
| `excited` | 1.2 s | loop | squash → hop −15 px → settle; `eyes` scale 1.09 |
| `webShoot` | 2.6 s | loop | `armR` −52°, `webShot` scale-X 0.1 → 1.08 → 1, fade out |
| `swing` | 3.2 s | loop | `root` rotate ±12° about a pivot 30% above the artboard |
| `hang` | 4.8 s | loop | `root` rotate ±12° about a pivot 55% above the artboard |

Blink runs on a second layer so it composes with every other state, exactly
like the CSS version.

## Exporting

1. **File → Export → Runtime (.riv)**
2. Save as `public/rive/web-byte.riv`
3. `npm run dev` — `RiveMascot` HEAD-probes the file and takes over.

## Keeping the SVG fallback honest

`shared/mascot.mjs` holds both the drawing and `mascotCss`, the five state
animations. If you change timings in Rive, mirror them there so the exported
README assets keep matching the live prototype.
