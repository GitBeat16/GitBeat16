# How this profile is built

The README you see on the profile page is **generated**. Nothing in it is
hand-maintained markup, and none of the animation is faked with GIFs.

```
data/profile.ts            ← all résumé content (single source of truth)
data/contributions.json    ← real GitHub calendar data
shared/theme.mjs           ← colour + type tokens
shared/mascot.mjs          ← the mascot drawing + its 5 animation states
        │
        ├──▶ src/**            Next.js prototype   (npm run dev)
        └──▶ scripts/**        SVG exporter        (npm run assets)
                     │
                     └──▶ readme/*.svg  ←  referenced by README.md
```

## Commands

| command | what it does |
| --- | --- |
| `npm run dev` | live prototype at <http://localhost:3000> — Rive/SVG mascot, Framer Motion, interactive contribution web |
| `npm run assets` | re-export every `readme/*.svg` from the current data |
| `npm run sync:contributions` | pull the real contribution calendar into `data/contributions.json` |
| `npm run sync` | both of the above, in order |
| `npm run build` | production build of the prototype |

## Updating your content

Edit **`data/profile.ts`** — name, tagline, education, skills, projects,
achievements, contact. Then:

```bash
npm run assets
```

Every SVG that mentions that content is re-rendered. The prototype picks the
change up on the next render; no other file needs touching.

## Updating the contribution web

```bash
# exact data (recommended) — any classic PAT with read:user
GITHUB_TOKEN=ghp_xxx npm run sync

# no token: falls back to the public calendar page
npm run sync
```

You normally don't need to run this by hand:
[`.github/workflows/sync-contributions.yml`](.github/workflows/sync-contributions.yml)
runs it daily at 03:17 UTC (and on every push to `main`) using the built-in
`GITHUB_TOKEN`, regenerates the assets, and commits only if something changed.

## Why SVG and not GIF

GitHub serves README images through its camo proxy, which passes SVG through
intact — CSS animation and SMIL both run. That buys us:

- **~300 KB for the whole profile**, versus multi-megabyte GIFs
- crisp text at any zoom, and real `<title>` / `<desc>` for screen readers
- no re-encoding step, so `npm run assets` is instant

Every animation uses `animation-fill-mode: backwards`, so if the visitor has
`prefers-reduced-motion` set — or the animation simply never starts — the
artwork still renders in its final, fully legible state. `readme/mascot-static.svg`
is a completely motion-free version of the character.

## The mascot

`shared/mascot.mjs` is the single drawing, consumed by both the React component
and the exporter. It has five states — `idle`, `excited`, `webShoot`, `swing`,
`hang` — driven by a class on the `<svg>` root (`is-idle`, `is-excited`, …).

To move the character to a real Rive rig, follow
[`rive/README.md`](rive/README.md): it documents the exact artboard, bone names,
state machine and animation timings the runtime code already expects. Drop the
exported `web-byte.riv` into `public/rive/` and `RiveMascot` picks it up
automatically, falling back to the SVG if it's absent.

## Adding a section

1. Add the content to `data/profile.ts`.
2. Add a render function in `scripts/generate-readme-assets.mjs` and a
   `write('my-section.svg', mySection())` call at the bottom.
3. Add a matching `head('sec-my-section.svg', 'TITLE', 'kicker')`.
4. `npm run assets`, then reference `readme/my-section.svg` from `README.md`.

Keep the generator deterministic — no `Math.random()`, no `Date.now()` — so
re-running it produces a clean diff.
