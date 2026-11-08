import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  r: number;
}

/** Golden sparks that trail the cursor. Only mounted for fine pointers (desktop) without reduced motion. */
export function CursorTrail() {
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setEnabled(mq.matches && !reduced);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [reduced]);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const glow = document.createElement('canvas');
    glow.width = glow.height = 32;
    const g = glow.getContext('2d')!;
    const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,240,200,1)');
    grad.addColorStop(0.35, 'rgba(247,217,138,0.6)');
    grad.addColorStop(1, 'rgba(255,157,66,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 32, 32);

    let sparks: Spark[] = [];
    let raf = 0;
    let last = 0;
    let lastX = -1;
    let lastY = -1;
    let w = 0;
    let h = 0;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      sparks = sparks.filter((s) => (s.life += dt) < s.max);
      for (const s of sparks) {
        s.vy += 30 * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        const t = 1 - s.life / s.max;
        ctx.globalAlpha = t;
        const size = s.r * (0.5 + t);
        ctx.drawImage(glow, s.x - size, s.y - size, size * 2, size * 2);
      }
      ctx.globalAlpha = 1;
      if (sparks.length) raf = requestAnimationFrame(frame);
      else {
        ctx.clearRect(0, 0, w, h);
        raf = 0;
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);
      if (dist < 6) return;
      lastX = e.clientX;
      lastY = e.clientY;
      const n = Math.min(3, 1 + Math.floor(dist / 25));
      for (let i = 0; i < n && sparks.length < 120; i++) {
        sparks.push({
          x: e.clientX + (Math.random() - 0.5) * 6,
          y: e.clientY + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 40,
          vy: (Math.random() - 0.5) * 30 - 10,
          life: 0,
          max: 0.5 + Math.random() * 0.5,
          r: 3 + Math.random() * 5,
        });
      }
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
    };
  }, [enabled]);

  if (!enabled) return null;
  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[60] h-full w-full" />;
}
