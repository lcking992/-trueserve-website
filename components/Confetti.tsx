"use client";

import { useEffect, useRef } from "react";

type ConfettiProps = {
  /** When this prop transitions to `true`, fire one confetti burst. */
  trigger: boolean;
  /** How many particles. Default 140. */
  count?: number;
  /** Animation duration in ms. Default 3500. */
  duration?: number;
  /** Color palette. Defaults to TrueServe brand colors. */
  colors?: string[];
};

/**
 * Lightweight canvas-based confetti. Zero deps. Fixed full-viewport overlay,
 * non-interactive, auto-cleans when the burst finishes.
 *
 * Respects prefers-reduced-motion (does nothing).
 */
export default function Confetti({
  trigger,
  count = 140,
  duration = 3500,
  colors = ["#FF6B35", "#14B8A6", "#FFB091", "#5BD9C5", "#FFFFFF", "#FFE7DD"],
}: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const firedOnceRef = useRef(false);

  useEffect(() => {
    if (!trigger) return;
    if (firedOnceRef.current) return; // only burst once per mount
    firedOnceRef.current = true;

    if (typeof window === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      rot: number;
      vrot: number;
      size: number;
      color: string;
      shape: "rect" | "circle";
    };

    const W = () => window.innerWidth;
    const H = () => window.innerHeight;

    // Spawn from top in a wide arc.
    const particles: Particle[] = Array.from({ length: count }, () => {
      const fromLeft = Math.random() < 0.5;
      const startX = fromLeft
        ? W() * (0.05 + Math.random() * 0.25)
        : W() * (0.70 + Math.random() * 0.25);
      const angle =
        fromLeft
          ? Math.PI * 0.5 + Math.random() * 0.5 // down-right
          : Math.PI * 0.5 - Math.random() * 0.5; // down-left
      const speed = 8 + Math.random() * 8;
      return {
        x: startX,
        y: -20 - Math.random() * 80,
        vx: Math.cos(angle) * speed * (fromLeft ? 1 : -1),
        vy: Math.sin(angle) * speed * -1, // initially upward then gravity pulls
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.3,
        size: 6 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: Math.random() < 0.6 ? "rect" : "circle",
      };
    });

    const start = performance.now();
    const gravity = 0.35;
    const drag = 0.992;

    const draw = (t: number) => {
      const elapsed = t - start;
      ctx.clearRect(0, 0, W(), H());

      for (const p of particles) {
        p.vy += gravity;
        p.vx *= drag;
        p.vy *= drag;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vrot;

        const fade = Math.max(0, 1 - elapsed / duration);
        ctx.globalAlpha = fade;
        ctx.fillStyle = p.color;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size / 1.5);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2.4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      if (elapsed < duration) {
        rafRef.current = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, W(), H());
      }
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [trigger, count, duration, colors]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
}
