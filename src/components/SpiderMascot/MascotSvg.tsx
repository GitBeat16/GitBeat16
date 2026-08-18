'use client';

import { useMemo } from 'react';
import { mascotMarkup, mascotCss, MASCOT_VIEWBOX } from '@shared/mascot.mjs';
import type { MascotState } from './useMascotState';

const STATE_CLASS: Record<MascotState, string> = {
  idle: 'is-idle',
  excited: 'is-excited',
  webShoot: 'is-webshoot',
  swing: 'is-swing',
  hang: 'is-hang',
};

let injected = false;
function useMascotStylesheet() {
  useMemo(() => {
    if (injected || typeof document === 'undefined') return;
    const el = document.createElement('style');
    el.dataset.mascot = 'true';
    el.textContent = mascotCss;
    document.head.appendChild(el);
    injected = true;
  }, []);
}

export interface MascotSvgProps {
  state?: MascotState;
  size?: number;
  uid?: string;
  showHeadphones?: boolean;
  showTail?: boolean;
  className?: string;
  title?: string;
}

/**
 * Pure-SVG renderer for the mascot. Shares one drawing with the README asset
 * generator (shared/mascot.mjs) so the prototype and the exported art can
 * never drift apart.
 */
export default function MascotSvg({
  state = 'idle',
  size = 240,
  uid = 'app',
  showHeadphones = true,
  showTail = true,
  className = '',
  title = 'Web-Byte, the spider-suited mascot',
}: MascotSvgProps) {
  useMascotStylesheet();
  const markup = useMemo(
    () => mascotMarkup({ uid, showHeadphones, showTail }),
    [uid, showHeadphones, showTail]
  );

  return (
    <svg
      className={`${STATE_CLASS[state]} ${className}`}
      viewBox={`0 0 ${MASCOT_VIEWBOX.w} ${MASCOT_VIEWBOX.h}`}
      width={size}
      height={size}
      role="img"
      aria-label={title}
      dangerouslySetInnerHTML={{ __html: `<title>${title}</title>${markup}` }}
    />
  );
}
