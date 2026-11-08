import { memo } from 'react';

/** Swinging akash kandil (sky lantern) with a warm inner glow. */
export const Lantern = memo(function Lantern({ className = '', delay = 0 }: { className?: string; delay?: number }) {
  return (
    <div className={`lantern ${className}`} style={{ animationDelay: `${-delay}s` }} aria-hidden="true">
      <svg viewBox="0 0 100 260" className="h-full w-full overflow-visible">
        <defs>
          <radialGradient id="ln-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#FFB25C" stopOpacity="0.7" />
            <stop offset="1" stopColor="#FF9D42" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ln-pane" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFD27A" />
            <stop offset="0.5" stopColor="#FF8A2A" />
            <stop offset="1" stopColor="#9C1F2E" />
          </linearGradient>
        </defs>
        <line x1="50" y1="0" x2="50" y2="62" stroke="#D4AF37" strokeWidth="1.2" />
        <circle cx="50" cy="128" r="80" fill="url(#ln-glow)" className="lantern-glow" />
        <path d="M38 62 H62 L68 76 H32 Z" fill="#D4AF37" />
        <path d="M50 76 L88 126 L50 182 L12 126 Z" fill="url(#ln-pane)" stroke="#F7D98A" strokeWidth="2" />
        <path d="M50 76 L50 182 M12 126 H88 M31 101 L69 151 M69 101 L31 151" stroke="#F7D98A" strokeWidth="1" opacity="0.7" />
        <path d="M50 92 L72 126 L50 162 L28 126 Z" fill="none" stroke="#FFF1C1" strokeWidth="0.8" opacity="0.6" />
        <circle cx="50" cy="126" r="7" fill="#FFF1C1" opacity="0.9" />
        <path d="M40 182 H60 L56 192 H44 Z" fill="#D4AF37" />
        {[-8, -4, 0, 4, 8].map((dx) => (
          <path key={dx} d={`M${50 + dx / 2} 192 Q ${50 + dx} 220 ${50 + dx * 1.3} 250`} stroke="#F7D98A" strokeWidth="1.2" fill="none" opacity="0.85" />
        ))}
      </svg>
    </div>
  );
});
