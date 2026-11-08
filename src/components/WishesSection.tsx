import { motion, type Variants } from 'framer-motion';
import { Feather, Gem, Sun, type LucideIcon } from 'lucide-react';

interface Wish {
  title: string;
  hindi: string;
  text: string;
  Icon: LucideIcon;
}

const WISHES: Wish[] = [
  { title: 'Happiness', hindi: 'सुख', text: 'May your days be filled with laughter.', Icon: Sun },
  { title: 'Prosperity', hindi: 'समृद्धि', text: 'May success follow every step.', Icon: Gem },
  { title: 'Peace', hindi: 'शांति', text: 'May your heart always find peace.', Icon: Feather },
];

const card: Variants = {
  hidden: { opacity: 0, y: 70, rotateX: 18, scale: 0.94 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: { delay: i * 0.18, duration: 1.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function WishesSection({ name }: { name: string }) {
  return (
    <section aria-labelledby="wishes-title" className="relative px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="eyebrow reveal">Three blessings</p>
          <h2 id="wishes-title" className="reveal mt-5 font-display text-[clamp(2.2rem,6vw,4.2rem)] font-semibold leading-tight text-champagne text-balance">
            A Wish Just For <span className="gold-text">{name}</span>
          </h2>
        </div>

        <ul className="mt-14 grid gap-6 [perspective:1200px] md:grid-cols-3 md:gap-8">
          {WISHES.map(({ title, hindi, text, Icon }, i) => (
            <motion.li
              key={title}
              custom={i}
              variants={card}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.35 }}
              className="wish-card group"
            >
              <span className="wish-card-glow" aria-hidden="true" />
              <span className="wish-number" aria-hidden="true">
                0{i + 1}
              </span>
              <div className="relative grid size-16 place-items-center rounded-full border border-gold/50 bg-gradient-to-br from-burgundy to-maroon shadow-[0_0_30px_-6px_rgba(255,157,66,0.6)] transition duration-500 group-hover:scale-110 group-hover:shadow-[0_0_40px_-2px_rgba(255,157,66,0.8)]">
                <Icon className="size-7 text-champagne" strokeWidth={1.5} aria-hidden="true" />
              </div>
              <p className="relative mt-8 font-display text-lg text-orange/90" lang="hi">
                {hindi}
              </p>
              <h3 className="relative mt-1 font-display text-4xl font-semibold text-champagne">{title}</h3>
              <p className="relative mt-4 text-base leading-relaxed text-champagne/75">{text}</p>
              <span className="relative mt-8 block h-px w-16 bg-gradient-to-r from-gold to-transparent transition-all duration-700 group-hover:w-full" aria-hidden="true" />
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
