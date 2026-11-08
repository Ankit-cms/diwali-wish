import { useRef, useState, type FormEvent } from 'react';
import { motion, useAnimationControls, type Variants } from 'framer-motion';
import { AnimatedDiya } from './AnimatedDiya';
import { Lantern } from './Lantern';
import { Toran } from './Toran';
import { MAX_NAME_LENGTH, validateName, type NameError } from '../lib/name';

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.35 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 28, filter: 'blur(10px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] } },
};

const ERRORS: Record<Exclude<NameError, null>, string> = {
  empty: 'Please enter your name to unlock your surprise ✨',
  invalid: 'Please use letters for your name 🙂',
};

const FLOOR_DIYAS = [0, 1, 2, 3, 4];

interface WelcomeScreenProps {
  from: string;
  onUnlock: (name: string) => void;
}

export function WelcomeScreen({ from, onUnlock }: WelcomeScreenProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<NameError>(null);
  const shake = useAnimationControls();
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const result = validateName(value);
    if (result.error) {
      setError(result.error);
      void shake.start({ x: [0, -10, 9, -6, 4, 0], transition: { duration: 0.45 } });
      inputRef.current?.focus();
      return;
    }
    setError(null);
    onUnlock(result.name);
  };

  return (
    <motion.main
      id="main"
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-5 pb-36 pt-28 text-center sm:pb-44"
      exit={{ opacity: 0, scale: 1.06, filter: 'blur(12px)', transition: { duration: 0.8, ease: [0.65, 0, 0.35, 1] } }}
    >
      <Toran className="pointer-events-none absolute inset-x-0 top-0 h-[64px] w-full sm:h-[96px]" />
      <Lantern className="absolute left-[4%] top-0 h-[150px] w-[58px] sm:left-[8%] sm:h-[230px] sm:w-[88px]" delay={0.4} />
      <Lantern className="absolute right-[8%] top-0 hidden h-[190px] w-[72px] sm:block" delay={1.6} />
      <div className="welcome-moon" aria-hidden="true" />

      <motion.div variants={container} initial="hidden" animate="show" className="relative z-10 mx-auto w-full max-w-3xl">
        <motion.div variants={item} className="mx-auto mb-6 flex items-end justify-center gap-3 sm:gap-5" aria-hidden="true">
          <AnimatedDiya className="w-12 sm:w-16" intensity={0.35} delay={0.3} />
          <AnimatedDiya className="w-20 sm:w-24" intensity={0.7} delay={0.9} />
          <AnimatedDiya className="w-12 sm:w-16" intensity={0.35} delay={1.4} />
        </motion.div>

        <motion.p variants={item} className="eyebrow">
          Shubh Deepavali · {new Date().getFullYear()}
        </motion.p>

        {from && (
          <motion.div variants={item} className="mt-5">
            <p className="mx-auto inline-flex max-w-full items-center gap-2 rounded-full border border-gold/30 bg-burgundy/30 px-4 py-1.5 text-sm text-champagne/90 backdrop-blur">
              <span aria-hidden="true">💌</span>
              <span className="truncate">
                <strong className="font-semibold text-champagne">{from}</strong> sent you a Diwali surprise
              </span>
            </p>
          </motion.div>
        )}

        <motion.h1
          variants={item}
          className="mt-6 font-display text-[clamp(2.6rem,9vw,6.2rem)] font-semibold leading-[0.98] tracking-tight text-champagne text-balance"
        >
          A Little Light,
          <span className="mt-1 block">
            A Lot of <em className="gold-shimmer font-medium">Happiness</em>
          </span>
        </motion.h1>

        <motion.p variants={item} className="mx-auto mt-6 max-w-md text-base text-champagne/75 sm:text-lg">
          This Diwali, a special wish is waiting just for you.
        </motion.p>

        <motion.form variants={item} onSubmit={submit} noValidate className="mx-auto mt-10 w-full max-w-md">
          <label htmlFor="visitor-name" className="sr-only">
            Your name
          </label>
          <motion.div animate={shake} className={`gold-field rounded-full p-px ${error ? 'is-error' : ''}`}>
            <input
              ref={inputRef}
              id="visitor-name"
              name="name"
              type="text"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (error) setError(null);
              }}
              maxLength={MAX_NAME_LENGTH + 20}
              autoComplete="given-name"
              autoCapitalize="words"
              spellCheck={false}
              enterKeyHint="go"
              placeholder="Enter your beautiful name..."
              aria-invalid={!!error}
              aria-describedby="visitor-name-error"
              className="w-full rounded-full bg-[#170A11] px-6 py-4 text-center text-lg text-champagne placeholder:text-champagne/35 focus:outline-none"
            />
          </motion.div>
          <p id="visitor-name-error" role="alert" className="min-h-7 pt-2 text-sm text-[#FFB4A8]">
            {error ? ERRORS[error] : ''}
          </p>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="btn-gold mt-2 w-full"
          >
            Unlock Your Diwali Surprise <span aria-hidden="true">✨</span>
          </motion.button>
        </motion.form>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1.5 }}
        className="pointer-events-none absolute inset-x-0 bottom-[max(1.25rem,env(safe-area-inset-bottom))] flex items-end justify-center gap-4 sm:gap-10"
        aria-hidden="true"
      >
        <div className="floor-glow" />
        {FLOOR_DIYAS.map((i) => (
          <AnimatedDiya
            key={i}
            className={i === 2 ? 'w-16 sm:w-24' : i % 2 ? 'w-12 sm:w-20' : 'w-10 sm:w-16'}
            intensity={i === 2 ? 0.6 : 0.4}
            delay={i * 0.37}
          />
        ))}
      </motion.div>
    </motion.main>
  );
}
