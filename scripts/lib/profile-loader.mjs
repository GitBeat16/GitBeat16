/**
 * Reads data/profile.ts from plain Node (no TS toolchain).
 *
 * profile.ts is deliberately written as pure data — object/array literals with
 * `as const`, no imports and no types — so stripping the few TS-only tokens and
 * evaluating it keeps ONE source of truth for the resume content, shared by the
 * Next.js app and the README asset generator.
 */
import fs from 'node:fs';

const EXPORTS = ['identity', 'education', 'arsenal', 'missions', 'achievements', 'about', 'speech'];

export function readProfile(file) {
  const raw = fs.readFileSync(file, 'utf8');

  const js = raw
    .replace(/\bas const\b/g, '')
    .replace(/^\s*import\s.*$/gm, '')
    .replace(/^\s*export\s+/gm, '');

  const fn = new Function(`${js}\nreturn { ${EXPORTS.join(', ')} };`);
  const out = fn();

  for (const k of EXPORTS) {
    if (out[k] === undefined) throw new Error(`profile.ts is missing export: ${k}`);
  }
  return out;
}
