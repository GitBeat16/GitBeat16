'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';
import { palette } from '@shared/theme.mjs';

/**
 * Deterministic SVG skyline with occasional window glow and web strands slung
 * between rooftops. Same seed -> same city, so it never flickers between renders.
 */
export default function CitySkyline({
  width = 880,
  height = 130,
  seed = 11,
  parallax = 0,
}: {
  width?: number;
  height?: number;
  seed?: number;
  parallax?: number;
}) {
  const reduce = useReducedMotion();

  const { buildings, windows, slings } = useMemo(() => {
    let s = seed;
    const rnd = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);

    const b: { x: number; y: number; w: number; h: number }[] = [];
    const w: { x: number; y: number; c: string; lit: boolean }[] = [];
    let cx = -10;

    while (cx < width) {
      const bw = 26 + Math.round(rnd() * 46);
      const bh = 30 + Math.round(rnd() * (height - 34));
      const by = height - bh;
      b.push({ x: cx, y: by, w: bw, h: bh });
      for (let wy = by + 8; wy < height - 8; wy += 11) {
        for (let wx = cx + 6; wx < cx + bw - 8; wx += 10) {
          const r = rnd();
          if (r > 0.62) {
            w.push({
              x: wx,
              y: wy,
              c: r > 0.9 ? palette.redBright : r > 0.78 ? palette.navyGlow : '#2A3352',
              lit: r > 0.93,
            });
          }
        }
      }
      cx += bw + 3 + Math.round(rnd() * 7);
    }

    const sl: string[] = [];
    for (let i = 0; i < 4; i++) {
      const a = b[Math.floor((i + 0.5) * (b.length / 5))];
      const c = b[Math.floor((i + 1.4) * (b.length / 5))];
      if (!a || !c) continue;
      const x1 = a.x + a.w / 2;
      const x2 = c.x + c.w / 2;
      sl.push(`M${x1} ${a.y}Q${(x1 + x2) / 2} ${Math.max(a.y, c.y) + 26} ${x2} ${c.y}`);
    }

    return { buildings: b, windows: w, slings: sl };
  }, [width, height, seed]);

  return (
    <motion.svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      role="presentation"
      aria-hidden="true"
      className="skyline"
      style={{ y: parallax }}
    >
      {slings.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={palette.edgeHi} strokeWidth={1} opacity={0.5} />
      ))}
      {buildings.map((b, i) => (
        <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} fill="#080A13" />
      ))}
      {windows.map((w, i) =>
        w.lit && !reduce ? (
          <motion.rect
            key={i}
            x={w.x}
            y={w.y}
            width={5}
            height={4}
            rx={1}
            fill={w.c}
            animate={{ opacity: [0.28, 1, 0.28] }}
            transition={{ duration: 4, repeat: Infinity, delay: (i % 5) * 0.8, ease: 'easeInOut' }}
          />
        ) : (
          <rect key={i} x={w.x} y={w.y} width={5} height={4} rx={1} fill={w.c} opacity={0.5} />
        )
      )}
    </motion.svg>
  );
}
