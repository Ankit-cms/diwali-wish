# 🪔 The Magical Diwali Experience

A cinematic, personalized and interactive Diwali greeting website. Visitors enter their name, then scroll through a celebration with golden fireworks, a diya they can light, three wish cards, a fireworks finale and a greeting card they can share.

> **A Little Light, A Lot of Happiness**

## ✨ Features

- **Two-stage journey**: an animated welcome screen with name validation, followed by a personalized celebration that loads on demand.
- **Shareable personalized links**: `/?name=Priya` opens Priya's celebration directly. The share button can also add a friend's name and sign the link from the sender (`/?name=Ravi&from=Kabir`).
- **Unicode-safe names**: works with Devanagari, Tamil, Bengali, Arabic, Latin and other scripts. Animated name letters are split by grapheme, so Indic syllables and emoji stay intact. Input is normalized, stripped of markup and symbols, capped at 40 characters, and only rendered as text (never as HTML).
- **Canvas effects**: one fireworks engine with peony, ring, willow, palm and glitter bursts, plus an ambient layer of stars, golden dust and falling marigold and rose petals. On desktop, golden sparks follow the cursor. Animation loops stop when nothing is moving.
- **Interactive diya**: each tap makes the flame larger and brighter, releases golden particles and plays an ascending bell.
- **Original music and sound effects**: everything is synthesized live with the Web Audio API (tanpura drone and santoor-style bells in Raag Bhupali, plus diya and firework sounds). There are no audio files, so there's nothing to license. Music never autoplays; it starts only when the visitor taps the music button, and a separate mute button controls all sound. The mute setting is saved.
- **Motion**: Framer Motion for page transitions and text reveals, GSAP ScrollTrigger for scroll reveals and dividers, and CSS for the flames, glows, toran and lanterns.
- **Accessibility**: semantic landmarks, a skip link, labelled controls, `aria-live` status messages, a full keyboard path through the page, and support for `prefers-reduced-motion`.
- **Mobile-first**: safe-area insets, `svh` units, touch-sized controls, lower particle and DPR limits on phones, and no horizontal overflow.

## 🧱 Tech stack

React 19 · Vite · TypeScript · Tailwind CSS v4 · Framer Motion · GSAP + ScrollTrigger · Lucide React · self-hosted fonts (Cormorant Garamond + Inter)

## 📁 Project structure

```
public/                 favicon, apple-touch-icon, Open Graph image
src/
  App.tsx               stage switching, URL personalization, global layers
  main.tsx              entry + font imports
  index.css             Tailwind theme (palette, fonts) + bespoke animations
  lib/
    name.ts             sanitize / validate names, URL read/write, share URLs
    audio.ts            Web Audio engine (music + sound effects)
    fireworks.ts        canvas fireworks / sparkle engine
  components/
    WelcomeScreen.tsx   Stage 1
    Celebration.tsx     Stage 2 shell (lazy-loaded, GSAP ScrollTrigger)
    DiwaliHero.tsx      Section 1 – grand reveal
    LightDiyaSection.tsx Section 2 – light the diya
    WishesSection.tsx   Section 3 – wish cards
    InteractiveCelebration.tsx Section 4 – fireworks button
    FinalGreeting.tsx   Section 5 – greeting card
    ShareButton.tsx     Web Share API + copy-link fallback
    MusicToggle.tsx     music + mute controls
    FireworksCanvas.tsx shared fireworks canvas + context
    FloatingParticles.tsx stars, dust, petals
    CursorTrail.tsx     desktop cursor sparkles
    AnimatedDiya.tsx, Rangoli.tsx, Toran.tsx, Lantern.tsx  hand-built SVG art
```

## 🚀 Local development

Requires **Node.js 18.18+** (Node 20+ recommended).

```bash
npm install
npm run dev        # http://localhost:5173
```

To try a personalized link locally, open `http://localhost:5173/?name=Ankit`.

```bash
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build at http://localhost:4173
```

## ▲ Deploy to Vercel

### Option A: GitHub + Vercel dashboard

1. Push this folder to a GitHub repository.
2. On [vercel.com/new](https://vercel.com/new), import the repository.
3. Vercel detects **Vite** automatically. Keep these defaults:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Click **Deploy**. You'll get a URL like `https://your-project.vercel.app`.

### Option B: Vercel CLI

```bash
npm install -g vercel
vercel            # first run links/creates the project (preview deployment)
vercel --prod     # production deployment
```

### Sharing

Send the plain URL so people can enter their own name, or send a personalized link:

```
https://your-project.vercel.app/?name=Ankit
```

You can also use the in-app **Share This Happiness** button. It opens the native share sheet when the browser supports it and copies the link otherwise.

### Notes

- `vercel.json` sends any path without a file extension to `index.html`, so direct links and query parameters always work. It also gives hashed `/assets` files a long cache lifetime.
- **No environment variables are required.** Open Graph image URLs are made absolute at build time using Vercel's built-in `VERCEL_PROJECT_PRODUCTION_URL`. If you use a custom domain and want link previews to reference it, set `SITE_URL=https://your-domain.com` in the Vercel project settings.

## 🙏 Credits

All illustrations (diyas, rangoli, toran, lanterns, icons and the social image) and all music and sound effects were created for this project in code. Fonts are self-hosted from the open-source [Fontsource](https://fontsource.org) packages (SIL Open Font License).

Happy Diwali! 🪔✨
