'use client';

import { motion } from 'framer-motion';

/** Horizontal web strand that draws itself in when scrolled into view. */
export default function WebDivider({ width = 880 }: { width?: number }) {
  const sag: string[] = [];
  for (let x = 40; x < width - 40; x += 56) sag.push(`M${x} 17Q${x + 28} 24 ${x + 56} 17`);

  return (
    <svg
      className="divider"
      viewBox={`0 0 ${width} 34`}
      width="100%"
      height={34}
      role="presentation"
      aria-hidden="true"
    >
      <motion.path
        d={`M0 17H${width}`}
        stroke="var(--edge)"
        strokeWidth={1.2}
        fill="none"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
      />
      <motion.path
        d={sag.join('')}
        stroke="var(--edge-hi)"
        strokeWidth={1}
        fill="none"
        opacity={0.7}
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.3, delay: 0.15, ease: 'easeOut' }}
      />
      <circle cx={6} cy={17} r={3} fill="var(--red-bright)" />
      <circle cx={width - 6} cy={17} r={3} fill="var(--navy-glow)" />
    </svg>
  );
}
