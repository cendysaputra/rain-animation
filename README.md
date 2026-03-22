# Rain Animation

A minimal, atmospheric portfolio page featuring an animated rain effect with scroll-driven text transitions.

## Preview

Background rain animation with ripple effects, grain texture overlay, and smooth panel transitions triggered by scroll.

## Features

- Animated rain drops with elliptical ripples on impact
- Grain texture overlay for a film-like aesthetic
- Scroll-pinned hero with 3 text panels animated via GSAP ScrollTrigger
- Dot navigation synced to scroll progress
- Zoom disabled (Ctrl+scroll, Ctrl+±)
- Scrollbar hidden across all browsers

## Tech Stack

- Vanilla JS + Canvas API — rain & ripple animation
- [GSAP](https://gsap.com/) + ScrollTrigger — scroll-driven text transitions (bundled locally in `lib/`)
- Google Fonts — Instrument Serif, Inter
- Plain CSS — no framework

## Project Structure

```
rain-animation/
├── lib/
│   ├── gsap.min.js
│   └── ScrollTrigger.min.js
├── index.html
├── style.css
├── rain.js
├── scroll-text.js
└── package.json
```

## Getting Started

No build step required. Open `index.html` directly in a browser, or serve it locally:

```bash
npx serve .
```

## Dependencies

GSAP is installed via npm and served from `lib/`. To reinstall or update:

```bash
npm install
cp node_modules/gsap/dist/gsap.min.js lib/gsap.min.js
cp node_modules/gsap/dist/ScrollTrigger.min.js lib/ScrollTrigger.min.js
```
