'use client';

import { motion } from 'framer-motion';

export interface SpeechBubbleProps {
  text: string;
  onClick?: () => void;
  className?: string;
}

/** Comic speech bubble used sparingly as an accent. */
export default function SpeechBubble({ text, onClick, className = '' }: SpeechBubbleProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`bubble ${className}`}
      initial={{ opacity: 0, scale: 0.86, rotate: -4 }}
      whileInView={{ opacity: 1, scale: 1, rotate: -1.5 }}
      whileHover={{ scale: 1.05, rotate: 1 }}
      whileTap={{ scale: 0.96 }}
      viewport={{ once: true }}
      transition={{ type: 'spring', stiffness: 320, damping: 18 }}
    >
      {text}
    </motion.button>
  );
}
