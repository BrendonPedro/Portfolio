# Brendon Pedro - Portfolio (now with 100% more jumping)

🌍 **Live:** https://brendonpedro.netlify.app/

My personal portfolio - plain HTML + SCSS + vanilla JavaScript, bundled with
[Parcel](https://parceljs.org/) and deployed to Netlify on every push to `main`.
No frameworks. That's the point.

## What's inside

- **The portfolio** - who I am, what I do (AI & Engineering Lead at
  [Pork Belly Creative](https://www.porkbellycreative.tw/en), where I built **Cortex**,
  PBC's production IP & outreach platform, while studying EECS at NYCU), and my projects.
- **🎮 Brendon's World** (`/game/`) - the portfolio as a playable, Dangerous-Dave-style
  DOS platformer. Vanilla JS on a `<canvas>`, 100% original pixel art drawn in code,
  8-bit sound effects generated with the Web Audio API (zero audio assets). Collect the
  gold cup to open each exit door, and grab my actual resume, my day job, and my
  projects as in-game loot. Keyboard + touch controls.
- **🗯️ Cape Town Slang Translator** (`/projects/slang-translator/`) - Kaapse slang to
  plain English. Aweh.
- **😂 Joke Generator 3000** (`/projects/joke-generator/`) - the machine behind the
  hero-section joke. Dad-grade humor on demand.

## Development

```bash
nvm use            # Node 16.14.2 (see .nvmrc)
npm install
npm start          # dev server
npm run build      # production build into dist/
```

The Parcel `source` entries (in `package.json`) cover the main page, the game, and both
mini-projects.

## Credits & license

Originally based on the [simplefolio](https://github.com/cobiwave/simplefolio) template
by [Jacobo Martínez](https://github.com/cobiwave) - thank you! Heavily customized since.

Game art & levels are original work, made lovingly *in the style of* early-90s DOS
platformers. No Dangerous Dave assets were harmed (or used).

Licensed under the [MIT License](LICENSE.md).

[![Netlify Status](https://api.netlify.com/api/v1/badges/344d01a9-47c9-4c47-bbd1-1d258fe15295/deploy-status)](https://app.netlify.com/sites/brendonpedro/deploys)
