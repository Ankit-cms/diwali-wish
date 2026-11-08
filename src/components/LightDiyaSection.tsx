import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AnimatedDiya } from './AnimatedDiya';
import { useFx } from './FireworksCanvas';
import { audio } from '../lib/audio';

const MAX = 5;
const MESSAGES = [
  'Tap the diya to light it',
  'The first light is lit ✨',
  'Brighter, and brighter…',
  'Hope is glowing',
  'Almost radiant!',
  'Your diya is shining at its brightest',
];

export function LightDiyaSection({ name }: { name: string }) {
  const [level, setLevel] = useState(0);
  const [pulse, setPulse] = useState(0);
  const btnRef = useRef<HTMLButtonElement>(null);
  const fx = useFx();

  const light = () => {
    const next = Math.min(MAX, level + 1);
    setLevel(next);
    setPulse((p) => p + 1);
    audio.diya(level);
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) fx.sparkle(rect.left + rect.width / 2, rect.top + rect.height * 0.32, 26 + next * 10);
  };

  const intensity = level === 0 ? 0 : 0.2 + (level / MAX) * 0.8;

  return (
    <section id="light-a-diya" aria-labelledby="diya-title" className="relative flex min-h-svh items-center justify-center overflow-hidden px-5 py-24">
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-1000"
        style={{
          opacity: 0.15 + intensity * 0.85,
          background: 'radial-gradient(circle at 50% 55%, rgba(255,157,66,0.32), rgba(90,23,40,0.18) 35%, transparent 65%)',
        }}
        aria-hidden="true"
      />
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
        <p className="eyebrow reveal">Light Up Your Happiness</p>
        <h2 id="diya-title" className="reveal mt-5 font-display text-[clamp(2.2rem,6.5vw,4.4rem)] font-semibold leading-tight text-champagne text-balance">
          Every diya you light brings a little more <em className="gold-shimmer">hope</em> into the world.
        </h2>

        <div className="reveal relative mt-10">
          <AnimatePresence>
            <motion.span
              key={pulse}
              initial={{ scale: 0.4, opacity: pulse ? 0.8 : 0 }}
              animate={{ scale: 2.4, opacity: 0 }}
              transition={{ duration: 1.3, ease: 'easeOut' }}
              className="pointer-events-none absolute left-1/2 top-[34%] size-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-champagne/60"
              aria-hidden="true"
            />
          </AnimatePresence>
          <motion.button
            ref={btnRef}
            type="button"
            onClick={light}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            aria-label={level === 0 ? 'Light the diya' : level < MAX ? 'Make the diya glow brighter' : 'Add more sparkle to the diya'}
            className="group relative block w-[min(68vw,300px)] cursor-pointer rounded-[40%] p-2 focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-champagne"
          >
            <AnimatedDiya lit={level > 0} intensity={intensity} className="w-full" />
          </motion.button>
        </div>

        <div className="mt-6 flex gap-2" aria-hidden="true">
          {Array.from({ length: MAX }, (_, i) => (
            <span
              key={i}
              className={`h-1.5 w-8 rounded-full transition-all duration-500 ${i < level ? 'bg-champagne shadow-[0_0_12px_#FF9D42]' : 'bg-gold/20'}`}
            />
          ))}
        </div>
        <p aria-live="polite" className="mt-5 min-h-7 text-base text-champagne/80 sm:text-lg">
          {level === MAX ? `${MESSAGES[MAX]}, just like you, ${name} 🪔` : MESSAGES[level]}
        </p>
      </div>
    </section>
  );
}
