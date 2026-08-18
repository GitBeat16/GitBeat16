'use client';

import { motion } from 'framer-motion';
import { useEffect } from 'react';
import RiveMascot from '../SpiderMascot/RiveMascot';
import { useMascotState } from '../SpiderMascot/useMascotState';

/**
 * The easter-egg mascot that lowers itself on a strand near the top of the page,
 * swings gently, and every so often flicks a small web. Click it and it perks up.
 */
export default function HangingMascot({ size = 130 }: { size?: number }) {
  const { state, trigger, setAmbient } = useMascotState('hang');

  // occasional web flick, never often enough to distract
  useEffect(() => {
    const id = setInterval(() => trigger('webShoot'), 11000);
    return () => clearInterval(id);
  }, [trigger]);

  return (
    <div className="hanger" aria-hidden="false">
      <motion.div
        className="hanger__line"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.1, ease: [0.25, 0.9, 0.35, 1] }}
      />
      <motion.div
        className="hanger__rig"
        initial={{ y: -180, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 60, damping: 11, delay: 0.15 }}
      >
        <motion.div
          animate={{ rotate: [-7, 7, -7] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '50% -40%' }}
        >
          <button
            type="button"
            className="hanger__hit"
            onMouseEnter={() => trigger('excited')}
            onFocus={() => trigger('excited')}
            onClick={() => trigger('webShoot')}
            onBlur={() => setAmbient('hang')}
            aria-label="Poke the mascot"
          >
            <RiveMascot state={state} size={size} uid="hang" title="Mascot hanging from a web strand" />
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
