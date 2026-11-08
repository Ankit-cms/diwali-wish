import { useEffect, useState, useSyncExternalStore } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { EighthNotes, Volume2, VolumeX } from 'lucide-react';
import { audio } from '../lib/audio';

export const useAudioState = () => useSyncExternalStore(audio.subscribe, audio.getSnapshot, audio.getSnapshot);

const pill =
  'inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-gold/35 bg-midnight/60 px-3.5 text-sm text-champagne backdrop-blur-md transition hover:border-champagne/70 hover:bg-burgundy/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne';

/** Music play/pause and global mute. Music only ever starts after the visitor taps. */
export function MusicToggle({ showHint = false }: { showHint?: boolean }) {
  const { supported, musicOn, muted } = useAudioState();
  const [hint, setHint] = useState(false);

  useEffect(() => {
    if (!showHint || musicOn) {
      setHint(false);
      return;
    }
    const on = window.setTimeout(() => setHint(true), 2200);
    const off = window.setTimeout(() => setHint(false), 9000);
    return () => {
      window.clearTimeout(on);
      window.clearTimeout(off);
    };
  }, [showHint, musicOn]);

  if (!supported) return null;

  return (
    <div className="relative flex items-center gap-2" role="group" aria-label="Sound controls">
      <button
        type="button"
        className={pill}
        aria-pressed={musicOn}
        aria-label={musicOn ? 'Pause festive music' : 'Play festive music'}
        onClick={() => {
          setHint(false);
          audio.toggleMusic();
        }}
      >
        <EighthNotes className="size-4" aria-hidden="true" />
        <span className="hidden sm:inline">{musicOn ? 'Music on' : 'Music'}</span>
        <span className="flex h-3.5 items-end gap-[2px]" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`eq-bar w-[3px] rounded-full bg-champagne ${musicOn && !muted ? 'is-playing' : ''}`}
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </span>
      </button>
      <button
        type="button"
        className={pill}
        aria-pressed={muted}
        aria-label={muted ? 'Unmute all sounds' : 'Mute all sounds'}
        onClick={() => audio.toggleMute()}
      >
        {muted ? <VolumeX className="size-4" aria-hidden="true" /> : <Volume2 className="size-4" aria-hidden="true" />}
      </button>

      <AnimatePresence>
        {hint && (
          <motion.p
            role="status"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute right-0 top-full mt-3 w-max max-w-[60vw] rounded-2xl border border-gold/30 bg-maroon/90 px-4 py-2 text-xs text-champagne shadow-[0_10px_40px_-10px_rgba(255,157,66,0.5)] backdrop-blur"
          >
            🎶 Tap for festive music
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
