'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ApprovalHeroLogo } from '@/components/brand/ApprovalHeroLogo';

export function CinematicIntro({ enabled = true, duration = 3500 }: { enabled?: boolean; duration?: number }) {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setMounted(true);
    if (!enabled) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const seen = sessionStorage.getItem('ah_intro_seen');

    if (prefersReduced || seen) return;

    setShow(true);
    timerRef.current = setTimeout(() => handleComplete(), duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [enabled, duration]);

  const handleComplete = () => {
    sessionStorage.setItem('ah_intro_seen', '1');
    setShow(false);
  };

  if (!mounted || !show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-midnight flex flex-col items-center justify-center overflow-hidden"
          exit={{ clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* Headlight beam */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-electric/20 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          />

          {/* Road SVG */}
          <svg className="absolute bottom-0 w-full h-32 opacity-30" viewBox="0 0 1440 120" fill="none">
            <motion.path
              d="M0 80 Q360 40 720 80 T1440 80"
              stroke="#0866FF"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
            />
          </svg>

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-center z-10"
          >
            <div className="flex justify-center mb-4">
              <ApprovalHeroLogo height={56} onDark />
            </div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="text-ice-blue text-lg tracking-wide"
            >
              Your Road Forward Starts Here
            </motion.p>
          </motion.div>

          <button
            onClick={handleComplete}
            className="absolute bottom-8 right-8 text-white/50 hover:text-white text-sm uppercase tracking-widest transition-colors"
          >
            Skip Intro
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
