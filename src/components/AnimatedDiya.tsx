import { memo, type CSSProperties } from 'react';

/** Shared gradients for every diya, rendered once so each lamp stays lightweight. */
export const DiyaDefs = memo(function DiyaDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: 'absolute' }}>
      <defs>
        <linearGradient id="dw-clay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#C8682F" />
          <stop offset="0.55" stopColor="#8A3417" />
          <stop offset="1" stopColor="#4A160B" />
        </linearGradient>
        <linearGradient id="dw-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFF1C1" />
          <stop offset="0.45" stopColor="#F7D98A" />
          <stop offset="0.75" stopColor="#D4AF37" />
          <stop offset="1" stopColor="#8C6A1A" />
        </linearGradient>
        <radialGradient id="dw-oil" cx="0.45" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#7A3A12" />
          <stop offset="0.6" stopColor="#3A1407" />
          <stop offset="1" stopColor="#1C0903" />
        </radialGradient>
        <linearGradient id="dw-flame-outer" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#FF7A1A" />
          <stop offset="0.6" stopColor="#FF9D42" />
          <stop offset="1" stopColor="#FFD27A" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="dw-flame-inner" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#FFE6A6" />
          <stop offset="1" stopColor="#FFF9EA" />
        </linearGradient>
        <radialGradient id="dw-flame-core" cx="0.5" cy="0.6" r="0.5">
          <stop offset="0" stopColor="#E8F2FF" />
          <stop offset="1" stopColor="#9DB8FF" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="dw-flame-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFC566" stopOpacity="0.8" />
          <stop offset="0.45" stopColor="#FF9D42" stopOpacity="0.25" />
          <stop offset="1" stopColor="#FF9D42" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
});

// Decorative dots following the inner curve of the bowl.
const DOTS = Array.from({ length: 11 }, (_, i) => {
  const t = 0.1 + (i / 10) * 0.8;
  const mt = 1 - t;
  const x = mt ** 3 * 36 + 3 * mt * mt * t * 44 + 3 * mt * t * t * 156 + t ** 3 * 164;
  const y = mt ** 3 * 130 + 3 * mt * mt * t * 160 + 3 * mt * t * t * 160 + t ** 3 * 130;
  return { x, y, big: i % 2 === 0 };
});

interface AnimatedDiyaProps {
  lit?: boolean;
  /** 0 – 1: how bright and tall the flame burns. */
  intensity?: number;
  className?: string;
  /** Offsets the flicker so rows of diyas never move in sync. */
  delay?: number;
}

export const AnimatedDiya = memo(function AnimatedDiya({
  lit = true,
  intensity = 0.5,
  className = '',
  delay = 0,
}: AnimatedDiyaProps) {
  const style = {
    '--intensity': intensity,
    '--flicker-delay': `${-delay}s`,
  } as CSSProperties;

  return (
    <div className={`diya relative ${className}`} data-lit={lit} style={style}>
      <div className="diya-halo" aria-hidden="true" />
      <svg viewBox="0 0 200 200" className="relative block h-auto w-full overflow-visible" aria-hidden="true">
        <g transform="translate(100 116)">
          <g className="diya-flame-scale">
            <ellipse className="diya-flame-glow" cx="0" cy="-34" rx="46" ry="58" fill="url(#dw-flame-glow)" />
            <g className="diya-flame">
              <path
                d="M0 -74 C 10 -52, 24 -38, 22 -19 C 20 -4, 10 2, 0 2 C -10 2, -20 -4, -22 -19 C -24 -38, -10 -52, 0 -74 Z"
                fill="url(#dw-flame-outer)"
              />
              <path
                d="M0 -50 C 6 -34, 15 -24, 14 -12 C 13 -3, 6 1, 0 1 C -6 1, -13 -3, -14 -12 C -15 -24, -6 -34, 0 -50 Z"
                fill="url(#dw-flame-inner)"
              />
              <ellipse cx="0" cy="-7" rx="6" ry="9" fill="url(#dw-flame-core)" />
            </g>
          </g>
        </g>

        {/* Stand */}
        <path d="M76 150 L124 150 L134 166 Q100 174 66 166 Z" fill="url(#dw-clay)" />
        <ellipse cx="100" cy="166" rx="34" ry="6" fill="#3A1208" />
        <path d="M70 162 Q100 170 130 162" stroke="url(#dw-gold)" strokeWidth="2" fill="none" />

        {/* Bowl */}
        <path d="M18 118 C 24 172, 176 172, 182 118 Z" fill="url(#dw-clay)" />
        <path d="M36 130 C 44 160, 156 160, 164 130" stroke="url(#dw-gold)" strokeWidth="2.2" fill="none" opacity="0.9" />
        {DOTS.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y + 8} r={d.big ? 3 : 1.8} fill={d.big ? '#F7D98A' : '#FF9D42'} />
        ))}
        {/* Lotus motif */}
        <g transform="translate(100 152)" fill="#F7D98A">
          <path d="M0 -14 C 6 -8, 6 -2, 0 2 C -6 -2, -6 -8, 0 -14 Z" />
          <path d="M-3 1 C -12 -2, -16 -8, -16 -10 C -10 -10, -4 -6, -1 -1 Z" opacity="0.85" />
          <path d="M3 1 C 12 -2, 16 -8, 16 -10 C 10 -10, 4 -6, 1 -1 Z" opacity="0.85" />
        </g>

        {/* Rim & oil */}
        <ellipse cx="100" cy="118" rx="82" ry="15" fill="url(#dw-gold)" />
        <ellipse cx="100" cy="117" rx="74" ry="11" fill="url(#dw-oil)" />
        <ellipse cx="82" cy="114" rx="26" ry="3" fill="#FFD27A" opacity="0.18" />
        {/* Wick */}
        <path d="M97 118 Q100 108 101 112 Q103 116 103 118 Z" fill="#2A1206" />
        <circle className="diya-ember" cx="100" cy="112" r="2.4" fill="#FF7A1A" />
      </svg>
    </div>
  );
});
