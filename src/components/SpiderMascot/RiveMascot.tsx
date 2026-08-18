'use client';

import { useEffect, useState } from 'react';
import { useRive, useStateMachineInput, Layout, Fit, Alignment } from '@rive-app/react-canvas';
import MascotSvg from './MascotSvg';
import type { MascotState } from './useMascotState';

/**
 * Rive-first mascot with a guaranteed SVG fallback.
 *
 * `public/rive/web-byte.riv` is authored in the Rive editor (see rive/README.md
 * for the exact artboard / state-machine contract). When that file is present
 * this component drives it through the `Mascot` state machine; when it is not —
 * or when Rive fails to load, or the visitor prefers reduced motion — it renders
 * the shared SVG mascot instead, which supports the same five states.
 *
 * Both renderers are driven by the identical `state` prop, so callers never
 * need to know which one is on screen.
 */

const RIV_SRC = '/rive/web-byte.riv';
const STATE_MACHINE = 'Mascot';

/** state -> Rive trigger/boolean input name */
const INPUT: Record<MascotState, string> = {
  idle: 'Idle',
  excited: 'Excited',
  webShoot: 'WebShoot',
  swing: 'Swing',
  hang: 'Hang',
};

export interface RiveMascotProps {
  state?: MascotState;
  size?: number;
  uid?: string;
  className?: string;
  title?: string;
}

export default function RiveMascot({
  state = 'idle',
  size = 240,
  uid = 'rive',
  className = '',
  title = 'Web-Byte, the spider-suited mascot',
}: RiveMascotProps) {
  const [hasRiv, setHasRiv] = useState<boolean | null>(null);

  // Probe once; avoids a noisy 404 render path when the .riv isn't authored yet.
  useEffect(() => {
    let alive = true;
    fetch(RIV_SRC, { method: 'HEAD' })
      .then((r) => alive && setHasRiv(r.ok))
      .catch(() => alive && setHasRiv(false));
    return () => {
      alive = false;
    };
  }, []);

  const { rive, RiveComponent } = useRive(
    hasRiv
      ? {
          src: RIV_SRC,
          stateMachines: STATE_MACHINE,
          autoplay: true,
          layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
        }
      : null
  );

  const input = useStateMachineInput(rive, STATE_MACHINE, INPUT[state]);

  useEffect(() => {
    if (!input) return;
    // Triggers fire; booleans latch. The authored machine uses triggers.
    if (typeof input.fire === 'function') input.fire();
    else input.value = true;
  }, [input, state]);

  if (hasRiv === null || hasRiv === false) {
    return <MascotSvg state={state} size={size} uid={uid} className={className} title={title} />;
  }

  return (
    <div
      className={className}
      style={{ width: size, height: size }}
      role="img"
      aria-label={title}
    >
      <RiveComponent />
    </div>
  );
}
