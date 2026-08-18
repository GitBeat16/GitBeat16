'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { palette } from '@shared/theme.mjs';
import contributions from '@data/contributions.json';

/**
 * Interactive prototype of the contribution web.
 *
 * This is the component the exported `readme/contribution-web.svg` is modelled
 * on: the same cell grid, the same cascade order, the same web strands between
 * busy days. GitHub cannot run React inside a README, so the generator script
 * re-renders this exact design as an animated SVG — see
 * scripts/generate-readme-assets.mjs.
 */

const DAY = 86400000;
const CELL = 12;
const GAP = 3;
const STEP = CELL + GAP;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type Cell = { date: string; count: number | null; x: number; y: number; level: number };

function useCalendar() {
  return useMemo(() => {
    const days = contributions.days as Record<string, number>;
    const start = new Date(`${contributions.range.from}T00:00:00Z`);
    const end = new Date(`${contributions.range.to}T00:00:00Z`);
    const gridStart = new Date(start.getTime() - start.getUTCDay() * DAY);

    const cells: Cell[] = [];
    const months: { label: string; x: number }[] = [];
    let max = 0;
    let total = 0;
    let lastMonth = '';
    let col = 0;

    for (let t = gridStart.getTime(); t <= end.getTime(); t += 7 * DAY, col++) {
      for (let d = 0; d < 7; d++) {
        const date = new Date(t + d * DAY);
        const key = date.toISOString().slice(0, 10);
        const inRange = date >= start && date <= end;
        const count = inRange ? days[key] ?? 0 : null;
        if (count) {
          total += count;
          max = Math.max(max, count);
          const m = key.slice(0, 7);
          if (m !== lastMonth) {
            lastMonth = m;
            months.push({ label: MONTHS[Number(m.slice(5, 7)) - 1], x: col * STEP });
          }
        }
        cells.push({ date: key, count, x: col * STEP, y: d * STEP, level: 0 });
      }
    }

    for (const c of cells) c.level = levelOf(c.count, max);

    const hot = cells.filter((c) => c.level >= 3);
    const links: { d: string; delay: number }[] = [];
    for (let i = 0; i < hot.length - 1; i++) {
      const a = hot[i];
      const b = hot[i + 1];
      const ax = a.x + CELL / 2;
      const ay = a.y + CELL / 2;
      const bx = b.x + CELL / 2;
      const by = b.y + CELL / 2;
      if (Math.hypot(bx - ax, by - ay) > 64) continue;
      links.push({
        d: `M${ax} ${ay}Q${(ax + bx) / 2} ${(ay + by) / 2 + 9} ${bx} ${by}`,
        delay: (a.x / (col * STEP)) * 4.4,
      });
    }

    return { cells, months, total, width: col * STEP, height: 7 * STEP, cols: col, links };
  }, []);
}

function levelOf(count: number | null, max: number) {
  if (!count) return 0;
  if (max <= 4) return Math.min(4, count);
  const q = max / 4;
  if (count <= Math.max(1, q * 0.5)) return 1;
  if (count <= q) return 2;
  if (count <= q * 2) return 3;
  return 4;
}

export default function ContributionWeb() {
  const cal = useCalendar();

  return (
    <div className="contrib">
      <header className="contrib__head">
        <div>
          <h3>Contribution web</h3>
          <p>Every commit spins another thread.</p>
        </div>
        <div className="contrib__total">
          <strong>{cal.total.toLocaleString('en-US')}</strong>
          <span>
            contributions · {contributions.range.from} → {contributions.range.to}
          </span>
        </div>
      </header>

      <svg
        viewBox={`0 0 ${cal.width + 8} ${cal.height + 26}`}
        width="100%"
        role="img"
        aria-label={`Contribution calendar: ${cal.total} contributions between ${contributions.range.from} and ${contributions.range.to}`}
      >
        {cal.months.map((m, i) => (
          <text key={`${m.label}-${i}`} x={m.x} y={9} fontSize={9.5} fill={palette.textFaint}>
            {m.label}
          </text>
        ))}

        <g transform="translate(0 18)">
          {cal.cells.map(
            (c) =>
              c.count !== null && (
                <motion.rect
                  key={c.date}
                  x={c.x}
                  y={c.y}
                  width={CELL}
                  height={CELL}
                  rx={2.8}
                  fill={palette.ramp[c.level]}
                  initial={{ opacity: 0, scale: 0.4 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    delay: (c.x / cal.width) * 4.4 + (c.y / cal.height) * 0.12,
                    ease: [0.3, 1.4, 0.5, 1],
                  }}
                  whileHover={{ scale: 1.5 }}
                >
                  <title>{`${c.date}: ${c.count} contribution${c.count === 1 ? '' : 's'}`}</title>
                </motion.rect>
              )
          )}

          {cal.links.map((l, i) => (
            <motion.path
              key={i}
              d={l.d}
              fill="none"
              stroke={palette.redBright}
              strokeWidth={0.9}
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.5 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: l.delay + 0.3 }}
            />
          ))}
        </g>
      </svg>

      <footer className="contrib__legend">
        <span>Less</span>
        {palette.ramp.map((c) => (
          <i key={c} style={{ background: c }} />
        ))}
        <span>More</span>
      </footer>
    </div>
  );
}
