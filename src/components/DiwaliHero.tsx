import { useEffect, useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, type Variants } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Rangoli } from './Rangoli';
import { Toran } from './Toran';
import { Lantern } from './Lantern';
import { useFx } from './FireworksCanvas';
import { splitGraphemes } from '../lib/name';

const line: Variants = {
  hidden: { opacity: 0, y: 40, filter: 'blur(12px)' },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { delay: 0.5 + i * 0.25, duration: 1.2, ease: [0.22, 1, 0.36, 1] },
  }),
};

const letter: Variants = {
  hidden: { opacity: 0, y: '0.5em', rotateX: -70 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { delay: 1 + i * 0.06, duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function DiwaliHero({ name }: { name: string }) {
  const ref = useRef<HTMLElement>(null);
  const fx = useFx();
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const rangoliY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-25%']);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Cinematic opening salvo, then a slow ambient rhythm while the hero is visible.
  useEffect(() => {
    const cancels: (() => void)[] = [];
    const timers: number[] = [];
    timers.push(window.setTimeout(() => cancels.push(fx.volley(reduced ? 2 : 5)), 700));
    if (!reduced) {
      const id = window.setInterval(() => {
        if (document.hidden || window.scrollY > window.innerHeight * 0.7) return;
        fx.launch({ ambient: true });
      }, 2600);
      timers.push(id);
    }
    return () => {
      timers.forEach((t) => {
        window.clearTimeout(t);
        window.clearInterval(t);
      });
      cancels.forEach((c) => c());
    };
  }, [fx, reduced]);

  const words = name.split(' ');
  let index = 0;

  return (
    <section
      ref={ref}
      aria-labelledby="hero-title"
      className="relative flex min-h-svh items-center justify-center overflow-hidden px-5 pb-28 pt-32 text-center"
    >
      <Toran className="pointer-events-none absolute inset-x-0 top-0 h-[64px] w-full sm:h-[96px]" />
      <Lantern className="absolute left-[3%] top-0 hidden h-[200px] w-[76px] md:block" delay={0.8} />
      <Lantern className="absolute right-[3%] top-0 hidden h-[170px] w-[64px] md:block" delay={2} />
      <div className="light-rays" aria-hidden="true" />

      <motion.div
        style={reduced ? undefined : { y: rangoliY }}
        className="pointer-events-none absolute inset-0 grid place-items-center [mask-image:radial-gradient(circle_at_center,black_35%,transparent_70%)]"
        aria-hidden="true"
      >
        <Rangoli className="rangoli-spin w-[min(135vw,860px)] opacity-[0.14]" />
      </motion.div>

      <motion.div style={reduced ? undefined : { y: textY, opacity: fade }} className="relative z-10 mx-auto max-w-5xl">
        <motion.p custom={0} variants={line} initial="hidden" animate="show" className="eyebrow">
          The Festival of Lights
        </motion.p>
        <h1 id="hero-title" aria-label={`Happy Diwali, ${name}!`} className="mt-6 font-display font-semibold leading-[0.95] tracking-tight text-champagne [perspective:800px]">
          <motion.span aria-hidden="true" custom={1} variants={line} initial="hidden" animate="show" className="block text-[clamp(2.4rem,8vw,5.6rem)]">
            Happy Diwali,
          </motion.span>
          <span aria-hidden="true" className="mt-2 block text-[clamp(2.8rem,11vw,8rem)] [overflow-wrap:anywhere]">
            {words.map((word, w) => (
              <span key={w} className="inline-block whitespace-nowrap">
                {splitGraphemes(word).map((ch) => {
                  const i = index++;
                  return (
                    <motion.span key={i} custom={i} variants={letter} initial="hidden" animate="show" className="gold-text inline-block">
                      {ch}
                    </motion.span>
                  );
                })}
                {w < words.length - 1 && <span className="inline-block">&nbsp;</span>}
              </span>
            ))}
            <motion.span custom={index + 1} variants={letter} initial="hidden" animate="show" className="inline-block">
              !
            </motion.span>{' '}
            <motion.span
              initial={{ opacity: 0, scale: 0.3, rotate: -20 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 1.4 + index * 0.06, type: 'spring', stiffness: 180, damping: 12 }}
              className="inline-block align-middle text-[0.6em]"
              role="img"
              aria-label="diya"
            >
              🪔
            </motion.span>
          </span>
        </h1>
        <motion.p
          custom={4}
          variants={line}
          initial="hidden"
          animate="show"
          className="mx-auto mt-8 max-w-2xl text-pretty text-base leading-relaxed text-champagne/80 sm:text-xl"
        >
          May your life shine brighter than a thousand diyas, your heart overflow with happiness, and every new beginning
          bring endless opportunities.
        </motion.p>
      </motion.div>

      <motion.a
        href="#light-a-diya"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 1 }}
        className="absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 rounded-full p-2 text-xs uppercase tracking-[0.3em] text-champagne/60 transition hover:text-champagne focus-visible:outline-2 focus-visible:outline-champagne"
      >
        Scroll
        <span className="scroll-cue grid size-9 place-items-center rounded-full border border-gold/40">
          <ChevronDown className="size-4" aria-hidden="true" />
        </span>
      </motion.a>
    </section>
  );
}
