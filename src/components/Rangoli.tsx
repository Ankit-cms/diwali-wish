import { memo } from 'react';

const ring = (count: number) => Array.from({ length: count }, (_, i) => (i * 360) / count);

/** Procedurally drawn rangoli mandala in gold line-work. */
export const Rangoli = memo(function Rangoli({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="-200 -200 400 400" className={className} aria-hidden="true" focusable="false">
      <g fill="none" stroke="#D4AF37" strokeWidth="1.1" strokeLinejoin="round">
        <circle r="196" strokeDasharray="1 7" strokeLinecap="round" strokeWidth="2.4" />
        <circle r="188" opacity="0.7" />
        <circle r="118" opacity="0.6" />
        <circle r="46" opacity="0.8" />

        {ring(16).map((a) => (
          <path
            key={`o${a}`}
            transform={`rotate(${a})`}
            d="M0 -120 C 24 -140, 24 -168, 0 -184 C -24 -168, -24 -140, 0 -120 Z"
            fill="rgba(255,157,66,0.10)"
          />
        ))}
        {ring(16).map((a) => (
          <path key={`oi${a}`} transform={`rotate(${a})`} d="M0 -128 C 10 -142, 10 -160, 0 -172" opacity="0.6" />
        ))}
        {ring(16).map((a) => (
          <circle key={`d${a}`} transform={`rotate(${a + 11.25})`} cx="0" cy="-160" r="3" fill="#F7D98A" stroke="none" />
        ))}
        {ring(48).map((a) => (
          <circle key={`t${a}`} transform={`rotate(${a})`} cx="0" cy="-112" r="1.4" fill="#F7D98A" stroke="none" />
        ))}

        {ring(12).map((a) => (
          <path
            key={`l${a}`}
            transform={`rotate(${a})`}
            d="M0 -48 C 32 -66, 32 -92, 0 -108 C -32 -92, -32 -66, 0 -48 Z"
            fill="rgba(90,23,40,0.45)"
            stroke="#F7D98A"
          />
        ))}
        {ring(12).map((a) => (
          <path key={`li${a}`} transform={`rotate(${a})`} d="M0 -58 C 14 -70, 14 -86, 0 -96 C -14 -86, -14 -70, 0 -58 Z" opacity="0.7" />
        ))}
        {ring(8).map((a) => (
          <path
            key={`c${a}`}
            transform={`rotate(${a})`}
            d="M0 -14 C 12 -22, 12 -36, 0 -44 C -12 -36, -12 -22, 0 -14 Z"
            fill="rgba(212,175,55,0.18)"
          />
        ))}
        <circle r="10" fill="rgba(255,157,66,0.35)" stroke="#F7D98A" />
        <circle r="4" fill="#F7D98A" stroke="none" />
      </g>
    </svg>
  );
});
