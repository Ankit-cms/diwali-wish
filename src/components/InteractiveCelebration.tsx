import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useFx } from './FireworksCanvas';

export function InteractiveCelebration({ name }: { name: string }) {
  const fx = useFx();
  const reduced = useReducedMotion();
  const [count, setCount] = useState(0);
  const cancels = useRef<(() => void)[]>([]);

  useEffect(() => () => cancels.current.forEach((c) => c()), []);

  const celebrate = () => {
    const isMobile = window.innerWidth < 768;
    const n = reduced ? 2 : isMobile ? 5 : 8;
    cancels.current.push(fx.volley(n));
    if (!reduced) {
      const id = window.setTimeout(() => {
        fx.launch({ x: window.innerWidth / 2, targetY: window.innerHeight * 0.22, shape: 'willow' });
      }, n * 240 + 300);
      cancels.current.push(() => window.clearTimeout(id));
    }
    setCount((c) => c + 1);
  };

  return (
    <section aria-labelledby="celebrate-title" className="relative flex min-h-[90svh] items-center justify-center overflow-hidden px-5 py-24">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-[radial-gradient(ellipse_at_50%_100%,rgba(90,23,40,0.55),transparent_65%)]" aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <p className="eyebrow reveal">The Fireworks Celebration</p>
        <h2 id="celebrate-title" className="reveal mt-5 font-display text-[clamp(2.3rem,7vw,4.8rem)] font-semibold leading-tight text-champagne text-balance">
          Let's Make This Diwali <span className="gold-shimmer italic">Unforgettable!</span>
        </h2>
        <p className="reveal mx-auto mt-5 max-w-md text-champagne/70">Light up the sky, {name}. Tap as many times as your heart desires.</p>

        <div className="reveal mt-12 flex justify-center">
          <motion.button
            type="button"
            onClick={celebrate}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.93 }}
            className="celebrate-btn"
          >
            <span className="celebrate-ring" aria-hidden="true" />
            <Sparkles className="size-6" aria-hidden="true" />
            Celebrate Diwali
          </motion.button>
        </div>
        <p aria-live="polite" className="mt-8 min-h-6 text-sm tracking-wide text-champagne/60">
          {count > 0 && `✨ ${count} ${count === 1 ? 'celebration' : 'celebrations'} lit up the sky`}
        </p>
      </div>
    </section>
  );
}
