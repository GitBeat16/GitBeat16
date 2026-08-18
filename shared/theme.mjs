/**
 * Design tokens for the Spider-Tech universe.
 * Derived from the mascot badge: deep maroon suit, #172143 navy, off-white ink.
 *
 * Imported by BOTH the Next.js app (src/**) and the README asset
 * generator (scripts/**) so the live prototype and the exported SVGs
 * can never drift apart.
 */

export const palette = {
  // surfaces
  void: '#06070E',
  bg: '#0B0D16',
  panel: '#101426',
  panelHi: '#151B31',
  edge: '#232B47',
  edgeHi: '#33406B',

  // brand
  red: '#B5303F',
  redBright: '#E0475A',
  redDeep: '#6B1826',
  redInk: '#3D0E19',
  navy: '#172143',
  navyLift: '#2C3A6B',
  navyGlow: '#4C63B6',

  // ink
  text: '#ECE7E4',
  textDim: '#9AA3BE',
  textFaint: '#5C6684',

  // contribution ramp (level 0..4)
  ramp: ['#1E2437', '#4E1724', '#8E2434', '#C43D4E', '#F45B6D'],
};

export const font = {
  // Comic-ish display stack; all web-safe so exported SVG renders
  // identically on GitHub without embedding a font file.
  display: "'Trebuchet MS', 'Verdana', 'DejaVu Sans', sans-serif",
  body: "'Segoe UI', 'Helvetica Neue', 'DejaVu Sans', Arial, sans-serif",
  mono: "'SFMono-Regular', 'DejaVu Sans Mono', Menlo, Consolas, monospace",
};

export const layout = {
  /** README assets are authored at this width and scale down responsively. */
  readmeWidth: 880,
  radius: 14,
};
