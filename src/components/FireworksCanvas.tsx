import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useReducedMotion } from 'framer-motion';
import { FireworksEngine, type LaunchOptions } from '../lib/fireworks';
import { audio } from '../lib/audio';

export interface FxApi {
  launch: (options?: LaunchOptions) => void;
  volley: (count: number, ambient?: boolean) => () => void;
  sparkle: (x: number, y: number, count?: number) => void;
}

const noop = () => {};
const FxContext = createContext<FxApi>({ launch: noop, volley: () => noop, sparkle: noop });

export const useFx = () => useContext(FxContext);

/** A single full-screen canvas that renders every firework and sparkle in the experience. */
export function FireworksCanvas({ children }: { children: ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<FireworksEngine | null>(null);
  const reduced = !!useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new FireworksEngine(canvas, {
      reduced,
      onLaunch: (pan, ambient) => {
        if (!ambient) audio.launch(pan);
      },
      onBurst: (pan, size, ambient) => audio.burst(pan, size, ambient),
    });
    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
    // The engine is created once; reduced-motion changes are pushed in the effect below.
  }, []);

  useEffect(() => {
    engineRef.current?.setReduced(reduced);
  }, [reduced]);

  const api = useMemo<FxApi>(
    () => ({
      launch: (options) => engineRef.current?.launch(options),
      volley: (count, ambient) => engineRef.current?.volley(count, ambient) ?? noop,
      sparkle: (x, y, count) => engineRef.current?.sparkle(x, y, count),
    }),
    [],
  );

  return (
    <FxContext.Provider value={api}>
      <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[5] h-full w-full" />
      {children}
    </FxContext.Provider>
  );
}
