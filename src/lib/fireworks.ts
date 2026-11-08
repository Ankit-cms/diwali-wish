export type BurstShape = 'peony' | 'ring' | 'willow' | 'glitter' | 'palm';

interface Spark {
  x: number;
  y: number;
  px: number;
  py: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  color: string;
  size: number;
  gravity: number;
  drag: number;
  twinkle: boolean;
}

interface Rocket {
  x: number;
  y: number;
  px: number;
  py: number;
  vx: number;
  vy: number;
  targetY: number;
  shape: BurstShape;
  palette: Palette;
  ambient: boolean;
}

interface Flash {
  x: number;
  y: number;
  life: number;
  max: number;
  size: number;
}

type Palette = [string, string];

export interface LaunchOptions {
  /** Horizontal launch position in CSS px. */
  x?: number;
  /** Explosion height in CSS px. */
  targetY?: number;
  shape?: BurstShape;
  ambient?: boolean;
}

export interface FireworksCallbacks {
  onLaunch?: (pan: number, ambient: boolean) => void;
  onBurst?: (pan: number, size: number, ambient: boolean) => void;
}

const GOLD: Palette = ['#F7D98A', '#D4AF37'];
const PALETTES: Palette[] = [
  GOLD,
  ['#FFB25C', '#F7D98A'],
  ['#FF6F91', '#F7D98A'],
  ['#8FD3FF', '#F7D98A'],
  ['#7CF2B5', '#FFE7A8'],
  ['#C9A0FF', '#FF9D42'],
  ['#FFF4DC', '#D4AF37'],
];
const SHAPES: BurstShape[] = ['peony', 'peony', 'ring', 'willow', 'glitter', 'palm'];
const ROCKET_GRAVITY = 900;

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

function makeGlowSprite(color: string, size = 64): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, color);
  grad.addColorStop(0.25, color + 'aa');
  grad.addColorStop(1, color + '00');
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

export class FireworksEngine {
  private ctx: CanvasRenderingContext2D;
  private sparks: Spark[] = [];
  private rockets: Rocket[] = [];
  private flashes: Flash[] = [];
  private raf = 0;
  private last = 0;
  private idleFrames = 0;
  private w = 0;
  private h = 0;
  private scale = 1;
  private maxSparks: number;
  private glow: HTMLCanvasElement;
  private reduced: boolean;
  private callbacks: FireworksCallbacks;

  constructor(private canvas: HTMLCanvasElement, options: { reduced: boolean } & FireworksCallbacks) {
    this.ctx = canvas.getContext('2d')!;
    this.reduced = options.reduced;
    this.callbacks = options;
    this.glow = makeGlowSprite('#FFE3A3');
    this.maxSparks = 1600;
    this.resize();
    window.addEventListener('resize', this.resize);
  }

  setReduced(reduced: boolean) {
    this.reduced = reduced;
  }

  private resize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const mobile = w < 768;
    const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
    this.w = w;
    this.h = h;
    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.scale = Math.max(0.55, Math.min(1.2, Math.min(w, h) / 820));
    this.maxSparks = mobile ? 850 : 1700;
  };

  private pan(x: number) {
    return (x / Math.max(1, this.w)) * 2 - 1;
  }

  launch(options: LaunchOptions = {}) {
    const x = options.x ?? rand(this.w * 0.12, this.w * 0.88);
    const targetY = Math.max(40, options.targetY ?? rand(this.h * 0.12, this.h * 0.42));
    const startY = this.h + 10;
    const vy = -Math.sqrt(2 * ROCKET_GRAVITY * Math.max(60, startY - targetY));
    this.rockets.push({
      x,
      y: startY,
      px: x,
      py: startY,
      vx: rand(-30, 30),
      vy,
      targetY,
      shape: options.shape ?? pick(SHAPES),
      palette: Math.random() < 0.38 ? GOLD : pick(PALETTES),
      ambient: !!options.ambient,
    });
    this.callbacks.onLaunch?.(this.pan(x), !!options.ambient);
    this.start();
  }

  /** Several rockets with a natural, staggered rhythm. Returns a cancel function. */
  volley(count: number, ambient = false): () => void {
    const timers: number[] = [];
    for (let i = 0; i < count; i++) {
      const lane = (i + 0.5) / count;
      timers.push(
        window.setTimeout(
          () => this.launch({ x: this.w * (0.1 + lane * 0.8 + rand(-0.06, 0.06)), ambient }),
          i * rand(160, 320),
        ),
      );
    }
    return () => timers.forEach((t) => window.clearTimeout(t));
  }

  burst(x: number, y: number, shape: BurstShape = 'peony', palette: Palette = GOLD, ambient = false) {
    const s = this.scale;
    const density = (this.reduced ? 0.35 : 1) * (this.w < 768 ? 0.65 : 1);
    const room = Math.max(0, this.maxSparks - this.sparks.length);
    const add = (spark: Omit<Spark, 'px' | 'py'>) => {
      if (this.sparks.length >= this.maxSparks) return;
      this.sparks.push({ ...spark, px: spark.x, py: spark.y });
    };
    const [main, accent] = palette;
    const count = Math.min(room, Math.floor(rand(90, 130) * density));

    switch (shape) {
      case 'ring': {
        const tilt = rand(0.45, 1);
        const rot = rand(0, Math.PI);
        for (let i = 0; i < count; i++) {
          const a = (i / count) * Math.PI * 2;
          const sp = 250 * s;
          const rx = Math.cos(a) * sp;
          const ry = Math.sin(a) * sp * tilt;
          add({
            x, y,
            vx: rx * Math.cos(rot) - ry * Math.sin(rot),
            vy: rx * Math.sin(rot) + ry * Math.cos(rot),
            life: 0, max: rand(1.2, 1.6), color: i % 3 === 0 ? accent : main,
            size: 2, gravity: 110, drag: 0.975, twinkle: false,
          });
        }
        break;
      }
      case 'willow': {
        for (let i = 0; i < count; i++) {
          const a = Math.random() * Math.PI * 2;
          const sp = 230 * s * Math.sqrt(Math.random());
          add({
            x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
            life: 0, max: rand(2.2, 3.1), color: Math.random() < 0.7 ? '#F7D98A' : '#D4AF37',
            size: 1.6, gravity: 70, drag: 0.962, twinkle: true,
          });
        }
        break;
      }
      case 'palm': {
        const arms = Math.floor(rand(7, 10));
        const per = Math.max(4, Math.floor(count / arms));
        for (let k = 0; k < arms; k++) {
          const a = (k / arms) * Math.PI * 2 + rand(-0.1, 0.1);
          for (let i = 0; i < per; i++) {
            const sp = 300 * s * (0.35 + (i / per) * 0.65);
            add({
              x, y, vx: Math.cos(a) * sp + rand(-12, 12), vy: Math.sin(a) * sp + rand(-12, 12),
              life: 0, max: rand(1.4, 2), color: i > per * 0.6 ? accent : main,
              size: 2.2, gravity: 120, drag: 0.972, twinkle: false,
            });
          }
        }
        break;
      }
      default: {
        const glitter = shape === 'glitter';
        for (let i = 0; i < count; i++) {
          const a = Math.random() * Math.PI * 2;
          const sp = 280 * s * Math.pow(Math.random(), 0.45);
          add({
            x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
            life: 0, max: rand(1.1, 1.9), color: glitter ? (Math.random() < 0.6 ? '#FFF4DC' : main) : Math.random() < 0.75 ? main : accent,
            size: glitter ? 1.6 : 2, gravity: 130, drag: 0.972, twinkle: glitter,
          });
        }
      }
    }

    this.flashes.push({ x, y, life: 0, max: 0.35, size: 220 * s });
    this.callbacks.onBurst?.(this.pan(x), s, ambient);
    this.start();
  }

  /** Gentle golden particles rising from a point (used for diyas). */
  sparkle(x: number, y: number, count = 36) {
    const n = Math.floor(count * (this.reduced ? 0.4 : 1));
    for (let i = 0; i < n && this.sparks.length < this.maxSparks; i++) {
      const a = -Math.PI / 2 + rand(-1.4, 1.4);
      const sp = rand(60, 220);
      this.sparks.push({
        x, y, px: x, py: y,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        life: 0, max: rand(0.9, 1.7), color: Math.random() < 0.6 ? '#F7D98A' : '#FF9D42',
        size: rand(1.2, 2.4), gravity: 40, drag: 0.955, twinkle: Math.random() < 0.5,
      });
    }
    this.flashes.push({ x, y, life: 0, max: 0.5, size: 160 });
    this.start();
  }

  private start() {
    this.idleFrames = 0;
    if (this.raf) return;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  private frame = (now: number) => {
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    const { ctx, w, h } = this;
    const step = dt * 60;

    // Fade previous frame for natural light trails on a transparent canvas.
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = `rgba(0,0,0,${1 - Math.pow(1 - 0.22, step)})`;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';

    for (let i = this.rockets.length - 1; i >= 0; i--) {
      const r = this.rockets[i];
      r.px = r.x;
      r.py = r.y;
      r.vy += ROCKET_GRAVITY * dt;
      r.x += r.vx * dt;
      r.y += r.vy * dt;
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#FFE7B0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(r.px, r.py);
      ctx.lineTo(r.x, r.y);
      ctx.stroke();
      ctx.globalAlpha = 0.8;
      ctx.drawImage(this.glow, r.x - 10, r.y - 10, 20, 20);
      if (Math.random() < 0.6 && this.sparks.length < this.maxSparks) {
        this.sparks.push({
          x: r.x, y: r.y, px: r.x, py: r.y, vx: rand(-25, 25), vy: rand(20, 80),
          life: 0, max: rand(0.3, 0.6), color: '#FF9D42', size: 1.2, gravity: 60, drag: 0.95, twinkle: true,
        });
      }
      if (r.y <= r.targetY || r.vy >= -40) {
        this.rockets.splice(i, 1);
        this.burst(r.x, r.y, r.shape, r.palette, r.ambient);
      }
    }

    ctx.lineCap = 'round';
    let write = 0;
    for (let i = 0; i < this.sparks.length; i++) {
      const p = this.sparks[i];
      p.life += dt;
      if (p.life >= p.max) continue;
      const drag = Math.pow(p.drag, step);
      p.vx *= drag;
      p.vy = p.vy * drag + p.gravity * dt;
      p.px = p.x;
      p.py = p.y;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      const t = 1 - p.life / p.max;
      let alpha = t * t * (3 - 2 * t);
      if (p.twinkle && Math.random() < 0.35) alpha *= 0.25;
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = p.size;
      ctx.beginPath();
      ctx.moveTo(p.px, p.py);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      this.sparks[write++] = p;
    }
    this.sparks.length = write;

    for (let i = this.flashes.length - 1; i >= 0; i--) {
      const f = this.flashes[i];
      f.life += dt;
      if (f.life >= f.max) {
        this.flashes.splice(i, 1);
        continue;
      }
      const t = 1 - f.life / f.max;
      ctx.globalAlpha = t * 0.55;
      const size = f.size * (0.6 + (1 - t) * 0.6);
      ctx.drawImage(this.glow, f.x - size / 2, f.y - size / 2, size, size);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    const active = this.sparks.length || this.rockets.length || this.flashes.length;
    if (!active && ++this.idleFrames > 40) {
      ctx.clearRect(0, 0, w, h);
      this.raf = 0;
      return;
    }
    this.raf = requestAnimationFrame(this.frame);
  };

  destroy() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    window.removeEventListener('resize', this.resize);
    this.sparks = [];
    this.rockets = [];
    this.flashes = [];
  }
}
