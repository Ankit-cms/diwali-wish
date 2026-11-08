/**
 * Original, fully synthesized festive soundscape built with the Web Audio API:
 * a tanpura-style drone, a soft pad and santoor-like bells improvising in Raag Bhupali,
 * plus diya and firework sound effects. No audio files, so nothing to license or download.
 */

export interface AudioSnapshot {
  supported: boolean;
  musicOn: boolean;
  muted: boolean;
}

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

const MUTE_KEY = 'diwali:muted';
const SA = 146.83; // D3
const BHUPALI = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3]; // S R G P D
const BEAT = 0.42;
const TANPURA = [SA * 0.75, SA, SA, SA / 2]; // Pa (mandra), Sa, Sa, Sa (mandra)

const melodyFreq = (index: number) => SA * 2 * BHUPALI[index % 5] * 2 ** Math.floor(index / 5);

function createImpulse(ctx: BaseAudioContext, seconds: number, decay: number): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** decay;
  }
  return buffer;
}

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private reverbSend: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private padNodes: AudioScheduledSourceNode[] = [];
  private schedulerId: number | null = null;
  private stopTimer: number | null = null;
  private nextBeatTime = 0;
  private beat = 0;
  private melodyIndex = 5;
  private lastBurst = 0;
  private listeners = new Set<() => void>();
  private snapshot: AudioSnapshot;

  constructor() {
    let muted = false;
    try {
      muted = localStorage.getItem(MUTE_KEY) === '1';
    } catch {
      /* storage unavailable */
    }
    const supported =
      typeof window !== 'undefined' && !!(window.AudioContext || (window as WebkitWindow).webkitAudioContext);
    this.snapshot = { supported, musicOn: false, muted };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!this.ctx) return;
        if (document.hidden) void this.ctx.suspend();
        else void this.ctx.resume();
      });
    }
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => this.snapshot;

  private update(partial: Partial<AudioSnapshot>) {
    this.snapshot = { ...this.snapshot, ...partial };
    this.listeners.forEach((l) => l());
  }

  /** Creates/resumes the context. Must be first called from a user gesture. */
  private ensure(): AudioContext | null {
    if (!this.snapshot.supported) return null;
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as WebkitWindow).webkitAudioContext!;
      const ctx = new Ctor();
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -16;
      compressor.ratio.value = 4;
      compressor.connect(ctx.destination);

      const master = ctx.createGain();
      master.gain.value = this.snapshot.muted ? 0 : 0.9;
      master.connect(compressor);

      const reverb = ctx.createConvolver();
      reverb.buffer = createImpulse(ctx, 2.8, 2.6);
      reverb.connect(master);
      const reverbSend = ctx.createGain();
      reverbSend.gain.value = 0.45;
      reverbSend.connect(reverb);

      const musicBus = ctx.createGain();
      musicBus.gain.value = 0;
      musicBus.connect(master);
      musicBus.connect(reverbSend);

      const sfxBus = ctx.createGain();
      sfxBus.gain.value = 0.85;
      sfxBus.connect(master);

      const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const data = noise.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

      Object.assign(this, { ctx, master, musicBus, sfxBus, reverbSend, noise });
    }
    const ctx = this.ctx!;
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  }

  /* ---------------------------------- Music --------------------------------- */

  toggleMusic() {
    if (this.snapshot.musicOn) this.stopMusic();
    else this.startMusic();
  }

  startMusic() {
    const ctx = this.ensure();
    if (!ctx || !this.musicBus) return;
    if (this.snapshot.muted) this.setMuted(false);
    if (this.stopTimer) window.clearTimeout(this.stopTimer);
    this.stopTimer = null;

    const now = ctx.currentTime;
    this.musicBus.gain.cancelScheduledValues(now);
    this.musicBus.gain.setValueAtTime(this.musicBus.gain.value, now);
    this.musicBus.gain.linearRampToValueAtTime(0.6, now + 2.5);

    if (!this.padNodes.length) this.startPad(ctx);
    if (this.schedulerId === null) {
      this.nextBeatTime = now + 0.12;
      this.beat = 0;
      this.schedulerId = window.setInterval(this.tick, 60);
    }
    this.update({ musicOn: true });
  }

  stopMusic() {
    const ctx = this.ctx;
    this.update({ musicOn: false });
    if (!ctx || !this.musicBus) return;
    const now = ctx.currentTime;
    this.musicBus.gain.cancelScheduledValues(now);
    this.musicBus.gain.setValueAtTime(this.musicBus.gain.value, now);
    this.musicBus.gain.linearRampToValueAtTime(0, now + 1.2);
    this.stopTimer = window.setTimeout(() => {
      if (this.snapshot.musicOn) return;
      if (this.schedulerId !== null) window.clearInterval(this.schedulerId);
      this.schedulerId = null;
      this.padNodes.forEach((n) => n.stop());
      this.padNodes = [];
    }, 1400);
  }

  private tick = () => {
    const ctx = this.ctx;
    if (!ctx) return;
    // If the tab was suspended, skip ahead rather than flooding notes.
    if (this.nextBeatTime < ctx.currentTime - 0.5) this.nextBeatTime = ctx.currentTime + 0.05;
    while (this.nextBeatTime < ctx.currentTime + 0.3) {
      this.scheduleBeat(this.nextBeatTime, this.beat);
      this.nextBeatTime += BEAT;
      this.beat++;
    }
  };

  private scheduleBeat(t: number, beat: number) {
    if (beat % 2 === 0) this.tanpura(t, TANPURA[(beat / 2) % 4]);

    const bar = beat % 32;
    if (bar === 30) {
      this.melodyIndex = 5;
      this.bell(t, melodyFreq(5), 0.8, this.musicBus!, 2.6);
      return;
    }
    if (bar === 31) return;
    const chance = beat % 2 === 0 ? 0.55 : 0.22;
    if (Math.random() < chance) {
      const steps = [-2, -1, -1, 0, 1, 1, 2];
      this.melodyIndex = Math.min(9, Math.max(0, this.melodyIndex + steps[Math.floor(Math.random() * steps.length)]));
      this.bell(t, melodyFreq(this.melodyIndex), 0.45 + Math.random() * 0.4, this.musicBus!);
      // Santoor-like grace note
      if (Math.random() < 0.18 && this.melodyIndex < 9) {
        this.bell(t + BEAT / 2, melodyFreq(this.melodyIndex + 1), 0.3, this.musicBus!);
      }
    }
  }

  private tanpura(t: number, freq: number) {
    const ctx = this.ctx!;
    const out = ctx.createGain();
    out.gain.setValueAtTime(0, t);
    out.gain.linearRampToValueAtTime(0.055, t + 0.03);
    out.gain.exponentialRampToValueAtTime(0.0001, t + 3.6);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.value = 5;
    filter.frequency.setValueAtTime(freq * 16, t);
    filter.frequency.exponentialRampToValueAtTime(freq * 3, t + 2.8);
    filter.connect(out).connect(this.musicBus!);
    for (const detune of [-4, 4]) {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      osc.detune.value = detune;
      osc.connect(filter);
      osc.start(t);
      osc.stop(t + 3.7);
    }
  }

  private startPad(ctx: AudioContext) {
    const out = ctx.createGain();
    out.gain.value = 0.022;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    filter.connect(out).connect(this.musicBus!);

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.09;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.01;
    lfo.connect(lfoGain).connect(out.gain);
    lfo.start();

    const voices = [SA, SA * 1.5, SA * 2].map((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 1 ? 'sine' : 'triangle';
      osc.frequency.value = f;
      osc.detune.value = (i - 1) * 3;
      osc.connect(filter);
      osc.start();
      return osc;
    });
    this.padNodes = [lfo, ...voices];
  }

  private bell(t: number, freq: number, velocity: number, bus: AudioNode, length = 1.9) {
    const ctx = this.ctx!;
    const partials: [number, number][] = [
      [1, 1],
      [2, 0.32],
      [3.01, 0.14],
      [4.2, 0.06],
    ];
    const out = ctx.createGain();
    out.gain.value = 0.085 * velocity;
    out.connect(bus);
    partials.forEach(([ratio, amp], i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq * ratio;
      const env = ctx.createGain();
      const end = t + length / (1 + i * 0.6);
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(amp, t + 0.006);
      env.gain.exponentialRampToValueAtTime(0.0001, end);
      osc.connect(env).connect(out);
      osc.start(t);
      osc.stop(end + 0.05);
    });
  }

  /* ------------------------------ Sound effects ----------------------------- */

  private sfxReady(fromGesture: boolean): AudioContext | null {
    if (this.snapshot.muted) return null;
    if (!fromGesture && (!this.ctx || this.ctx.state !== 'running')) return null;
    return this.ensure();
  }

  private noiseSource(ctx: AudioContext) {
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    return src;
  }

  private panner(ctx: AudioContext, pan: number): AudioNode {
    if (typeof ctx.createStereoPanner !== 'function') {
      const g = ctx.createGain();
      g.connect(this.sfxBus!);
      return g;
    }
    const p = ctx.createStereoPanner();
    p.pan.value = Math.max(-1, Math.min(1, pan));
    p.connect(this.sfxBus!);
    p.connect(this.reverbSend!);
    return p;
  }

  /** Soft whoosh + an ascending bell that climbs the raag as more diyas are lit. */
  diya(step: number) {
    const ctx = this.sfxReady(true);
    if (!ctx) return;
    const t = ctx.currentTime + 0.01;
    const out = this.panner(ctx, 0);

    const src = this.noiseSource(ctx);
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.Q.value = 1.4;
    band.frequency.setValueAtTime(350, t);
    band.frequency.exponentialRampToValueAtTime(2600, t + 0.35);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.14, t + 0.08);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    src.connect(band).connect(env).connect(out);
    src.start(t);
    src.stop(t + 0.6);

    const index = 5 + (step % 6);
    this.bell(t + 0.06, melodyFreq(index), 0.9, out, 2.4);
    this.bell(t + 0.06, melodyFreq(index) * 2, 0.25, out, 1.4);
  }

  launch(pan: number) {
    const ctx = this.sfxReady(true);
    if (!ctx) return;
    const t = ctx.currentTime;
    const out = this.panner(ctx, pan);
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, t);
    osc.frequency.exponentialRampToValueAtTime(1900, t + 0.9);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.018, t + 0.1);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 1);
    osc.connect(env).connect(out);
    osc.start(t);
    osc.stop(t + 1.05);

    const hiss = this.noiseSource(ctx);
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 3000;
    const henv = ctx.createGain();
    henv.gain.setValueAtTime(0.04, t);
    henv.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
    hiss.connect(hp).connect(henv).connect(out);
    hiss.start(t);
    hiss.stop(t + 0.75);
  }

  burst(pan: number, size: number, ambient = false) {
    const ctx = this.sfxReady(!ambient);
    if (!ctx) return;
    const t = ctx.currentTime;
    if (t - this.lastBurst < 0.07) return;
    this.lastBurst = t;
    const level = (ambient ? 0.3 : 1) * Math.max(0.4, Math.min(1.2, size));
    const out = this.panner(ctx, pan);

    const boom = ctx.createOscillator();
    boom.type = 'sine';
    boom.frequency.setValueAtTime(110, t);
    boom.frequency.exponentialRampToValueAtTime(38, t + 0.7);
    const boomEnv = ctx.createGain();
    boomEnv.gain.setValueAtTime(0.0001, t);
    boomEnv.gain.exponentialRampToValueAtTime(0.4 * level, t + 0.015);
    boomEnv.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
    boom.connect(boomEnv).connect(out);
    boom.start(t);
    boom.stop(t + 1.25);

    const blast = this.noiseSource(ctx);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(2200, t);
    lp.frequency.exponentialRampToValueAtTime(260, t + 1.1);
    const blastEnv = ctx.createGain();
    blastEnv.gain.setValueAtTime(0.0001, t);
    blastEnv.gain.exponentialRampToValueAtTime(0.28 * level, t + 0.01);
    blastEnv.gain.exponentialRampToValueAtTime(0.0001, t + 1.3);
    blast.connect(lp).connect(blastEnv).connect(out);
    blast.start(t);
    blast.stop(t + 1.35);

    const crackles = ambient ? 6 : 14;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 2400;
    hp.connect(out);
    for (let i = 0; i < crackles; i++) {
      const ct = t + 0.3 + Math.random() * 1.1;
      const grain = ctx.createBufferSource();
      grain.buffer = this.noise;
      const genv = ctx.createGain();
      genv.gain.setValueAtTime(0.0001, ct);
      genv.gain.exponentialRampToValueAtTime((0.03 + Math.random() * 0.06) * level, ct + 0.003);
      genv.gain.exponentialRampToValueAtTime(0.0001, ct + 0.03);
      grain.connect(genv).connect(hp);
      grain.start(ct, Math.random() * 0.8);
      grain.stop(ct + 0.035);
    }
  }

  /* ---------------------------------- Mute ---------------------------------- */

  setMuted(muted: boolean) {
    try {
      localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
    } catch {
      /* storage unavailable */
    }
    if (this.ctx && this.master) {
      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setValueAtTime(this.master.gain.value, now);
      this.master.gain.linearRampToValueAtTime(muted ? 0 : 0.9, now + 0.25);
    }
    this.update({ muted });
  }

  toggleMute() {
    if (!this.snapshot.muted) {
      this.setMuted(true);
      return;
    }
    this.ensure();
    this.setMuted(false);
  }
}

export const audio = new AudioEngine();
