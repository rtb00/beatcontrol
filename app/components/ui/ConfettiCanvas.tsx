'use client';

import { useEffect, useRef } from 'react';

const COLORS = ['#22e0d0', '#ffce54', '#ff3547'];

/**
 * Subtle drifting-particle backdrop — a nod to "confetti" without pulling in
 * a 3D/animation library. Pure 2D canvas, capped particle count on mobile,
 * fully skipped for prefers-reduced-motion. Absolutely positioned by the
 * caller; fills its nearest positioned ancestor.
 */
export default function ConfettiCanvas({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let raf = 0;
    let particles: {
      x: number; y: number; r: number; vy: number; vx: number; rot: number; vr: number; color: string;
    }[] = [];

    function resize() {
      const parent = canvas!.parentElement;
      width = parent ? parent.clientWidth : window.innerWidth;
      height = parent ? parent.clientHeight : window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function init() {
      const count = width < 640 ? 30 : 55;
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 2 + Math.random() * 3,
        vy: 0.3 + Math.random() * 0.45,
        vx: (Math.random() - 0.5) * 0.45,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.025,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      }));
    }

    function tick() {
      ctx!.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.y += p.vy;
        p.x += p.vx;
        p.rot += p.vr;
        if (p.y > height + 10) {
          p.y = -10;
          p.x = Math.random() * width;
        }
        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate(p.rot);
        ctx!.fillStyle = p.color;
        ctx!.shadowColor = p.color;
        ctx!.shadowBlur = 6;
        ctx!.globalAlpha = 0.55;
        ctx!.fillRect(-p.r, -p.r * 0.4, p.r * 2, p.r * 0.8);
        ctx!.restore();
      }
      raf = requestAnimationFrame(tick);
    }

    resize();
    init();
    tick();

    const onResize = () => {
      resize();
      init();
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className={`pointer-events-none ${className}`} aria-hidden="true" />;
}
