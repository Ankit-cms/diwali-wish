import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { AnimatedDiya } from './AnimatedDiya';
import { Rangoli } from './Rangoli';
import { ShareButton } from './ShareButton';

interface FinalGreetingProps {
  name: string;
  from: string;
  onRestart: () => void;
}

export function FinalGreeting({ name, from, onRestart }: FinalGreetingProps) {
  return (
    <section aria-labelledby="final-title" className="relative px-4 pb-[max(3rem,env(safe-area-inset-bottom))] pt-20 sm:px-5 sm:pb-24 sm:pt-28">
      <motion.article
        initial={{ opacity: 0, y: 80, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
        className="greeting-card relative mx-auto max-w-2xl overflow-hidden rounded-[2rem] p-px"
      >
        <div className="relative overflow-hidden rounded-[calc(2rem-1px)] bg-[linear-gradient(160deg,#2A0C16_0%,#170A11_55%,#100B12_100%)] px-6 py-12 text-center sm:px-14 sm:py-16">
          <Rangoli className="pointer-events-none absolute -right-24 -top-24 w-72 opacity-[0.12]" />
          <Rangoli className="pointer-events-none absolute -bottom-28 -left-28 w-80 opacity-[0.1]" />
          <span className="card-corner left-4 top-4" aria-hidden="true" />
          <span className="card-corner right-4 top-4 rotate-90" aria-hidden="true" />
          <span className="card-corner bottom-4 right-4 rotate-180" aria-hidden="true" />
          <span className="card-corner bottom-4 left-4 -rotate-90" aria-hidden="true" />

          <AnimatedDiya className="relative mx-auto w-20" intensity={0.6} />
          <p className="eyebrow relative mt-4">Shubh Deepavali</p>

          <div className="relative mt-8 space-y-5 text-left font-display text-[1.3rem] leading-relaxed text-champagne/90 sm:text-[1.6rem]">
            <h2 id="final-title" className="text-[1.9rem] font-semibold text-champagne sm:text-[2.4rem]">
              Dear <span className="gold-text [overflow-wrap:anywhere]">{name}</span>,
            </h2>
            <p>
              May this festival of lights remove every darkness, bring new opportunities, and fill your life with love,
              laughter, success, and beautiful memories.
            </p>
            <p>Wishing you and your family a very Happy &amp; Prosperous Diwali!</p>
            <p className="pt-2 italic text-champagne">
              With lots of love <span aria-label="love" role="img">❤️</span>
              {from && (
                <span className="mt-1 block font-semibold not-italic text-gold [overflow-wrap:anywhere]">— {from}</span>
              )}
            </p>
          </div>

          <div className="divider relative my-10" aria-hidden="true">
            <span>✦</span>
          </div>

          <div className="relative">
            <ShareButton senderName={name} />
          </div>
        </div>
      </motion.article>

      <footer className="mx-auto mt-12 flex max-w-2xl flex-col items-center gap-4 text-center text-sm text-champagne/50">
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-champagne/70 transition hover:text-champagne focus-visible:outline-2 focus-visible:outline-champagne"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Not {name}? Create your own celebration
        </button>
        <p>Made with light &amp; love · Happy Diwali {new Date().getFullYear()} 🪔</p>
      </footer>
    </section>
  );
}
