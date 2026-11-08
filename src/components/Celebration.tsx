import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DiwaliHero } from './DiwaliHero';
import { LightDiyaSection } from './LightDiyaSection';
import { WishesSection } from './WishesSection';
import { InteractiveCelebration } from './InteractiveCelebration';
import { FinalGreeting } from './FinalGreeting';

gsap.registerPlugin(ScrollTrigger);

interface CelebrationProps {
  name: string;
  from: string;
  onRestart: () => void;
}

/** Stage 2: the scroll-driven, personalized celebration. Lazy-loaded so the welcome screen stays light. */
export default function Celebration({ name, from, onRestart }: CelebrationProps) {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      // Opacity (not autoAlpha/visibility) keeps unrevealed controls keyboard-focusable.
      gsap.set('.reveal', { opacity: 0, y: 48 });
      ScrollTrigger.batch('.reveal', {
        start: 'top 88%',
        once: true,
        onEnter: (els) =>
          gsap.to(els, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', stagger: 0.12, overwrite: true }),
      });
      gsap.utils.toArray<HTMLElement>('.section-divider').forEach((el) => {
        gsap.fromTo(
          el,
          { scaleX: 0 },
          { scaleX: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 55%', scrub: true } },
        );
      });
    }, root);
    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 600);
    return () => {
      window.clearTimeout(refresh);
      ctx.revert();
    };
  }, [reduced]);

  return (
    <motion.main
      ref={root}
      id="main"
      initial={{ opacity: 0, filter: 'blur(16px)', scale: 1.04 }}
      animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6 } }}
      transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      <DiwaliHero name={name} />
      <div className="section-divider" aria-hidden="true" />
      <LightDiyaSection name={name} />
      <div className="section-divider" aria-hidden="true" />
      <WishesSection name={name} />
      <div className="section-divider" aria-hidden="true" />
      <InteractiveCelebration name={name} />
      <FinalGreeting name={name} from={from} onRestart={onRestart} />
    </motion.main>
  );
}
