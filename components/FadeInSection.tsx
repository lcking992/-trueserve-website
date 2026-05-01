"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

interface FadeInSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "none";
}

export default function FadeInSection({ children, className, delay = 0, direction = "up" }: FadeInSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });
  const shouldReduceMotion = useReducedMotion();

  const initial = shouldReduceMotion ? {} : {
    opacity: 0,
    y: direction === "up" ? 22 : 0,
    x: direction === "left" ? -18 : 0,
  };

  const animate = isInView ? { opacity: 1, y: 0, x: 0 } : initial;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={initial}
      animate={animate}
      transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
