import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { WelcomeScreen } from './components/WelcomeScreen';
import { FireworksCanvas } from './components/FireworksCanvas';
import { FloatingParticles } from './components/FloatingParticles';
import { CursorTrail } from './components/CursorTrail';
import { MusicToggle } from './components/MusicToggle';
import { DiyaDefs } from './components/AnimatedDiya';
import { readGreetingFromUrl, writeGreetingToUrl, type Greeting } from './lib/name';

const loadCelebration = () => import('./components/Celebration');
const Celebration = lazy(loadCelebration);

export default function App() {
  const [greeting, setGreeting] = useState<Greeting>(readGreetingFromUrl);
  const stage = greeting.name ? 'celebration' : 'welcome';

  useEffect(() => {
    document.title = greeting.name
      ? `Happy Diwali, ${greeting.name}! 🪔`
      : 'A Little Light, A Lot of Happiness · Happy Diwali 🪔';
  }, [greeting.name]);

  // Warm up the celebration bundle while the visitor is typing their name.
  useEffect(() => {
    if (stage !== 'welcome') return;
    const id = window.setTimeout(() => void loadCelebration(), 1500);
    return () => window.clearTimeout(id);
  }, [stage]);

  useEffect(() => {
    const onPop = () => setGreeting(readGreetingFromUrl());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const unlock = useCallback((name: string) => {
    setGreeting((g) => {
      const next = { ...g, name };
      writeGreetingToUrl(next);
      return next;
    });
    window.scrollTo({ top: 0 });
  }, []);

  const restart = useCallback(() => {
    const next = { name: '', from: '' };
    writeGreetingToUrl(next);
    setGreeting(next);
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <DiyaDefs />
      <div className="vignette" aria-hidden="true" />
      <FloatingParticles petals={stage === 'celebration'} />
      <CursorTrail />

      <FireworksCanvas>
        <header className="fixed right-[max(1rem,env(safe-area-inset-right))] top-[max(1rem,env(safe-area-inset-top))] z-50">
          <MusicToggle showHint={stage === 'celebration'} />
        </header>

        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {stage === 'welcome' ? (
              <WelcomeScreen key="welcome" from={greeting.from} onUnlock={unlock} />
            ) : (
              <Suspense
                key="celebration"
                fallback={
                  <motion.div
                    className="grid min-h-svh place-items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    role="status"
                    aria-label="Lighting the diyas"
                  >
                    <span className="loader-flame" />
                  </motion.div>
                }
              >
                <Celebration key={greeting.name} name={greeting.name} from={greeting.from} onRestart={restart} />
              </Suspense>
            )}
          </AnimatePresence>
        </div>
      </FireworksCanvas>
    </MotionConfig>
  );
}
