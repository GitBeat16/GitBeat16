'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export interface ComicPanelProps {
  children: ReactNode;
  accent?: 'red' | 'navy';
  label?: string;
  className?: string;
  delay?: number;
}

/** Clipped-corner comic panel that reveals on scroll. */
export default function ComicPanel({
  children,
  accent = 'red',
  label,
  className = '',
  delay = 0,
}: ComicPanelProps) {
  return (
    <motion.section
      className={`panel panel--${accent} ${className}`}
      initial={{ opacity: 0, y: 26, rotate: -0.4 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 0.9, 0.28, 1] }}
    >
      {label && <span className="panel__label">{label}</span>}
      {children}
    </motion.section>
  );
}
