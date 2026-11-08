import { memo } from 'react';

const SWAGS = 6;
const WIDTH = 1200;
const SWAG_W = WIDTH / SWAGS;

const quad = (x0: number, x1: number, sag: number, t: number) => {
  const cx = (x0 + x1) / 2;
  const x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * x1;
  const y = (1 - t) ** 2 * 6 + 2 * (1 - t) * t * sag + t * t * 6;
  return { x, y };
};

const FLOWERS = Array.from({ length: SWAGS }, (_, s) =>
  Array.from({ length: 13 }, (_, i) => quad(s * SWAG_W, (s + 1) * SWAG_W, 78, (i + 0.5) / 13)),
).flat();

/** A traditional marigold & mango-leaf toran hanging across the top of the screen. */
export const Toran = memo(function Toran({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${WIDTH} 120`}
      preserveAspectRatio="xMidYMin slice"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id="tr-marigold" cx="0.4" cy="0.35" r="0.65">
          <stop offset="0" stopColor="#FFD27A" />
          <stop offset="0.6" stopColor="#FF9D42" />
          <stop offset="1" stopColor="#C4500F" />
        </radialGradient>
        <radialGradient id="tr-yellow" cx="0.4" cy="0.35" r="0.65">
          <stop offset="0" stopColor="#FFF0A8" />
          <stop offset="0.6" stopColor="#F7C440" />
          <stop offset="1" stopColor="#B07A0C" />
        </radialGradient>
        <linearGradient id="tr-leaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4F8A3C" />
          <stop offset="1" stopColor="#1F4A24" />
        </linearGradient>
      </defs>
      <line x1="0" y1="6" x2={WIDTH} y2="6" stroke="#D4AF37" strokeWidth="2" opacity="0.7" />
      {FLOWERS.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="8" fill={i % 2 ? 'url(#tr-yellow)' : 'url(#tr-marigold)'} />
      ))}
      {Array.from({ length: SWAGS + 1 }, (_, s) => (
        <g key={s} transform={`translate(${s * SWAG_W} 0)`}>
          <g className="toran-drop" style={{ animationDelay: `${-s * 0.7}s` }}>
          <line x1="0" y1="6" x2="0" y2="58" stroke="#D4AF37" strokeWidth="1.2" />
          <circle cx="0" cy="18" r="7" fill="url(#tr-marigold)" />
          <circle cx="0" cy="32" r="7" fill="url(#tr-yellow)" />
          <circle cx="0" cy="46" r="7" fill="url(#tr-marigold)" />
          <path d="M0 52 C 12 64, 12 86, 0 104 C -12 86, -12 64, 0 52 Z" fill="url(#tr-leaf)" />
          <path d="M0 56 L0 100" stroke="#D4AF37" strokeWidth="0.8" opacity="0.8" />
          </g>
        </g>
      ))}
    </svg>
  );
});
