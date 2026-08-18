'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * The mascot's state machine. Deliberately mirrors the Rive state machine
 * described in rive/README.md so `RiveMascot` can swap the SVG renderer for a
 * real `.riv` file without any caller changing.
 *
 *   idle ──hover/tap──▶ excited ──▶ idle
 *   idle ──trigger────▶ webShoot ──▶ idle
 *   swing / hang are ambient, set explicitly by the host component.
 */
export type MascotState = 'idle' | 'excited' | 'webShoot' | 'swing' | 'hang';

const AUTO_RETURN: Partial<Record<MascotState, number>> = {
  excited: 1250,
  webShoot: 2600,
};

export function useMascotState(initial: MascotState = 'idle') {
  const [state, setState] = useState<MascotState>(initial);
  const base = useRef<MascotState>(initial);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    base.current = initial;
  }, [initial]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  /** Fire a transient state that falls back to the ambient one. */
  const trigger = useCallback((next: MascotState) => {
    if (timer.current) clearTimeout(timer.current);
    setState(next);
    const ms = AUTO_RETURN[next];
    if (ms) timer.current = setTimeout(() => setState(base.current), ms);
  }, []);

  /** Change the ambient state (idle / swing / hang). */
  const setAmbient = useCallback((next: MascotState) => {
    base.current = next;
    if (timer.current) clearTimeout(timer.current);
    setState(next);
  }, []);

  return { state, trigger, setAmbient };
}
