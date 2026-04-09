'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface AnimatedCounterProps {
  value: string;
}

export function AnimatedCounter({ value }: AnimatedCounterProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (!isInView) return;

    // Parse the value to extract number and suffix
    const match = value.match(/^([\d.]+)(.*)$/);

    if (!match) {
      setDisplayValue(value);
      return;
    }

    const [, numStr, suffix] = match;
    const targetNum = parseFloat(numStr);

    if (isNaN(targetNum)) {
      setDisplayValue(value);
      return;
    }

    const duration = 2000;
    const steps = 60;
    const increment = targetNum / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(current + increment, targetNum);

      // Format: keep decimals if original has them, otherwise round
      const hasDecimals = numStr.includes('.');
      const formatted = hasDecimals ? current.toFixed(1) : Math.round(current).toString();

      setDisplayValue(formatted + suffix);

      if (step >= steps) {
        clearInterval(timer);
        setDisplayValue(value);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {displayValue}
    </motion.div>
  );
}
