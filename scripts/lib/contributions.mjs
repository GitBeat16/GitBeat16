/** Calendar maths + level bucketing for the contribution web. */

export const DAY = 86400000;

export const iso = (d) => d.toISOString().slice(0, 10);
export const parse = (s) => new Date(`${s}T00:00:00Z`);

/**
 * Build a GitHub-shaped calendar: columns are weeks (Sunday-first),
 * rows are weekdays. Returns { weeks, months, max, total, byMonth }.
 */
export function buildCalendar({ range, days }) {
  const start = parse(range.from);
  const end = parse(range.to);

  // back up to the Sunday on or before `start`
  const gridStart = new Date(start.getTime() - start.getUTCDay() * DAY);

  const weeks = [];
  let max = 0;
  let total = 0;
  const byMonth = new Map();

  for (let t = gridStart.getTime(); t <= end.getTime(); t += 7 * DAY) {
    const col = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(t + d * DAY);
      const key = iso(date);
      const inRange = date >= start && date <= end;
      const count = inRange ? days[key] || 0 : null;
      if (count) {
        total += count;
        max = Math.max(max, count);
        const mk = key.slice(0, 7);
        byMonth.set(mk, (byMonth.get(mk) || 0) + count);
      }
      col.push({ date: key, count, weekday: d });
    }
    weeks.push(col);
  }

  // month label positions: first column whose first in-range day starts a month
  const months = [];
  let lastLabel = '';
  weeks.forEach((col, i) => {
    const first = col.find((c) => c.count !== null);
    if (!first) return;
    const m = first.date.slice(0, 7);
    if (m !== lastLabel) {
      lastLabel = m;
      months.push({ col: i, label: MONTHS[Number(m.slice(5, 7)) - 1], key: m });
    }
  });

  return { weeks, months, max, total, byMonth };
}

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** GitHub-ish quartile bucketing, 0..4. */
export function level(count, max) {
  if (!count) return 0;
  if (max <= 4) return Math.min(4, count);
  const q = max / 4;
  if (count <= Math.max(1, q * 0.5)) return 1;
  if (count <= q) return 2;
  if (count <= q * 2) return 3;
  return 4;
}

/** Derived, non-invented stats. Everything is computed from the day map. */
export function deriveStats({ range, days }, calendar) {
  const entries = Object.entries(days).filter(([, v]) => v > 0);
  entries.sort((a, b) => (a[0] < b[0] ? -1 : 1));

  let best = { date: null, count: 0 };
  for (const [d, c] of entries) if (c > best.count) best = { date: d, count: c };

  // longest run of consecutive active days
  let longest = 0;
  let run = 0;
  let prev = null;
  for (const [d] of entries) {
    const t = parse(d).getTime();
    run = prev !== null && t - prev === DAY ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = t;
  }

  let topMonth = { key: null, count: 0 };
  for (const [k, v] of calendar.byMonth) if (v > topMonth.count) topMonth = { key: k, count: v };

  return {
    activeDays: entries.length,
    bestDay: best,
    longestStreak: longest,
    topMonth,
  };
}
