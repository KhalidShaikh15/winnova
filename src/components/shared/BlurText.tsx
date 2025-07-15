
'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

interface BlurTextProps {
  text: string;
  className?: string;
  variant?: {
    hidden: { y: number };
    visible: { y: number };
  };
  duration?: number;
  stagger?: number;
  once?: boolean;
}

const defaultVariants = {
  hidden: { y: 20 },
  visible: { y: 0 },
};

export default function BlurText({
  text,
  className,
  variant = defaultVariants,
  duration = 0.5,
  stagger = 0.05,
  once = true,
}: BlurTextProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.5, once });

  return (
    <motion.p
      ref={ref}
      className={cn(className, 'flex flex-wrap justify-center')}
      style={{ willChange: 'transform, opacity, filter' }}
    >
      {text.split(' ').map((word, i) => (
        <motion.span
          key={i}
          variants={variant}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          transition={{
            duration,
            delay: i * stagger,
            ease: 'easeOut',
          }}
          className="mr-[0.5em] mt-2 inline-block whitespace-nowrap"
          style={{
            filter: `blur(${isInView ? 0 : 8}px)`,
            opacity: isInView ? 1 : 0,
            willChange: 'filter, opacity',
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.p>
  );
}
