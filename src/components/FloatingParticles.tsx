import { memo, useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

interface Star {
  x: number;
  y: number;
  r: number;
  phase: number;
  speed: number;
}
interface Dust {
  x: number;
  y: number;
  r: number;
  vy: number;
  sway: number;
  phase: number;
  alpha: number;
}
interface Petal {
  x: number;
  y: number;
  vy: number;
  vx: number;
  rot: number;
  vr: number;
  flip: number;
  vf: number;
  size: number;
  sprite: number;
}

function sprite(size: number, draw: (g: CanvasRenderingContext2D, s: number) => void) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d')!, size);
  return c;
}

function petalSprite(inner: string, outer: string) {
  return sprite(40, (g, s) => {
    const grad = g.createLinearGradient(0, 0, s, s);
    grad.addColorStop(0, inner);
    grad.addColorStop(1, outer);
    g.fillStyle = grad;
    g.beginPath();
    g.moveTo(s / 2, 2);
    g.bezierCurveTo(s * 0.95, s * 0.25, s * 0.85, s * 0.8, s / 2, s - 2);
    g.bezierCurveTo(s * 0.15, s * 0.8, s * 0.05, s * 0.25, s / 2, 2);
    g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.18)';
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(s / 2, 6);
    g.lineTo(s / 2, s - 8);
    g.stroke();
  });
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

/**
 * Ambient background layer: twinkling stars, rising golden dust and drifting marigold / rose petals,
 * all on one canvas (no DOM nodes per particle) with gentle scroll parallax.
 */
export const FloatingParticles = memo(function FloatingParticles({ petals = true }: { petals?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const petalsRef = useRef(petals);
  const reduced = !!useReducedMotion();

  useEffect(() => {
    petalsRef.current = petals;
  }, [petals]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const glow = sprite(48, (g, s) => {
      const grad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      grad.addColorStop(0, 'rgba(255,236,190,1)');
      grad.addColorStop(0.3, 'rgba(247,217,138,0.55)');
      grad.addColorStop(1, 'rgba(212,175,55,0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, s, s);
    });
    const petalSprites = [
      petalSprite('#FFC15A', '#FF8A1F'),
      petalSprite('#FFD978', '#F2A900'),
      petalSprite('#FF7A8A', '#B3203F'),
      petalSprite('#FFF1DC', '#F3C9A0'),
    ];

    let w = 0;
    let h = 0;
    let stars: Star[] = [];
    let dust: Dust[] = [];
    let petalList: Petal[] = [];
    let raf = 0;
    let last = performance.now();

    const makePetal = (top: boolean): Petal => ({
      x: rand(0, w),
      y: top ? rand(-h * 0.3, -20) : rand(0, h),
      vy: rand(18, 42),
      vx: rand(-12, 12),
      rot: rand(0, Math.PI * 2),
      vr: rand(-1, 1),
      flip: rand(0, Math.PI * 2),
      vf: rand(1, 2.4),
      size: rand(10, 20),
      sprite: Math.floor(Math.random() * petalSprites.length),
    });

    const setup = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      const mobile = w < 768;
      const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const starCount = mobile ? 70 : 140;
      const dustCount = mobile ? 26 : 55;
      stars = Array.from({ length: starCount }, () => ({
        x: rand(0, w),
        y: rand(0, h) * rand(0.2, 1),
        r: rand(0.3, 1.3),
        phase: rand(0, Math.PI * 2),
        speed: rand(0.6, 2.2),
      }));
      dust = Array.from({ length: dustCount }, () => ({
        x: rand(0, w),
        y: rand(0, h),
        r: rand(4, 14),
        vy: rand(8, 26),
        sway: rand(8, 26),
        phase: rand(0, Math.PI * 2),
        alpha: rand(0.25, 0.75),
      }));
      petalList = Array.from({ length: mobile ? 9 : 16 }, () => makePetal(false));
    };

    const draw = (time: number, dt: number) => {
      const scroll = window.scrollY;
      ctx.clearRect(0, 0, w, h);

      for (const s of stars) {
        const tw = reduced ? 0.7 : 0.45 + 0.55 * Math.sin(s.phase + time * s.speed);
        const y = (((s.y - scroll * 0.05) % h) + h) % h;
        ctx.globalAlpha = Math.max(0.05, tw);
        ctx.fillStyle = '#FFF4DC';
        ctx.beginPath();
        ctx.arc(s.x, y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'lighter';
      for (const d of dust) {
        if (!reduced) {
          d.y -= d.vy * dt;
          if (d.y < -20) {
            d.y = h + 20;
            d.x = rand(0, w);
          }
        }
        const x = d.x + Math.sin(time * 0.6 + d.phase) * d.sway;
        const y = (((d.y - scroll * 0.12) % (h + 40)) + h + 40) % (h + 40) - 20;
        ctx.globalAlpha = d.alpha * (0.6 + 0.4 * Math.sin(time * 1.3 + d.phase));
        ctx.drawImage(glow, x - d.r, y - d.r, d.r * 2, d.r * 2);
      }
      ctx.globalCompositeOperation = 'source-over';

      if (petalsRef.current && !reduced) {
        ctx.globalAlpha = 0.85;
        for (let i = 0; i < petalList.length; i++) {
          const p = petalList[i];
          p.y += p.vy * dt;
          p.x += (p.vx + Math.sin(time + i) * 14) * dt;
          p.rot += p.vr * dt;
          p.flip += p.vf * dt;
          if (p.y > h + 30) petalList[i] = makePetal(true);
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.scale(1, Math.max(0.15, Math.abs(Math.cos(p.flip))));
          ctx.drawImage(petalSprites[p.sprite], -p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      draw(now / 1000, dt);
      raf = requestAnimationFrame(loop);
    };

    const onResize = () => {
      setup();
      if (reduced) draw(0, 0);
    };
    const onScroll = () => draw(0, 0);

    setup();
    if (reduced) {
      draw(0, 0);
      window.addEventListener('scroll', onScroll, { passive: true });
    } else {
      raf = requestAnimationFrame(loop);
    }
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
    };
  }, [reduced]);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 h-full w-full" />;
});
