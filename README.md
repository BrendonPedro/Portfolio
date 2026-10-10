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
- **🎈 He or She?** (`/reveal/`) - a private gender reveal invitation for Portesche &
  Brendon (Sunday 25 October 2026, 11:00 Taiwan). The invitation artwork tops the card,
  with a two-stage canvas platformer right under it: jump into the "He" or "She" balloon
  to guess, then into a gift box to RSVP (in person, online via Google Meet, or can't make
  it). Below the game, clickable cards give the venue (Google Maps), calendar and Meet
  links. Guests who'd rather not play get a classic RSVP form instead. Desktop players
  see the keyboard controls once as a short toast when stage 1 starts; touch players get
  on-screen buttons. The page has music: "Baby" (Fabolous) plays on the invitation and
  "Ain't It Fun" (Paramore) while the game runs, switching back on the thank-you screen
  and when leaving the form. Browsers only allow sound after a gesture, so the first tap
  or key press anywhere starts the song; a floating pill at the bottom right pauses and
  resumes it and shows the title. The in-game "sound" button silences everything (effects
  and music); the pill only controls the song.
  Answers go to [Netlify Forms](https://docs.netlify.com/forms/setup/) (form
  `reveal-rsvp`, form detection enabled in the Netlify dashboard, no backend); on
  localhost the submit is skipped and logged to the console. The page is `noindex` and
  left out of the sitemap on purpose - it's an invite, not a portfolio piece.

## Development

```bash
nvm use            # Node 16.14.2 (see .nvmrc)
npm install
npm start          # dev server
npm run build      # production build into dist/
```

GitHub Actions (`.github/workflows/build.yml`) runs `npm ci` and `npm run build` on
pushes and pull requests to `main` as a build check only - deploys are Netlify's job
(`netlify.toml`).

The Parcel `source` entries (in `package.json`) cover the main page, the game, the cover
letter, both mini-projects, and the reveal invitation. The `postbuild` script copies
`robots.txt` and `sitemap.xml` into `dist/`, plus the reveal's static files (`og.jpg`,
`share.png`, `event.ics`) into `dist/reveal/` so they keep their plain, unhashed URLs -
`og:image` has to be an absolute URL for chat-app link previews. The two songs
(`src/reveal/baby.mp3` and `aint-it-fun.mp3`, about 6 MB together) are referenced from
`<audio>` tags, so Parcel bundles them like any other asset - no copy step needed. They
are the only audio files in the repo; the size is accepted because it's a private invite
page. The reveal's event facts (venue, times, Meet link) live in one `EVENT` object at
the top of `src/reveal/reveal.js`; `src/reveal/event.ics` and the clickable details
cards under the game in `src/reveal/index.html` repeat them, so change all three
together. The local `gender_reveal/` inspiration folder is gitignored on purpose.

## Credits & license

Originally based on the [simplefolio](https://github.com/cobiwave/simplefolio) template
by [Jacobo Martínez](https://github.com/cobiwave) - thank you! Heavily customized since.

Game art & levels are original work, made lovingly _in the style of_ early-90s DOS
platformers. No Dangerous Dave assets were harmed (or used).

Licensed under the [MIT License](LICENSE.md).

[![Netlify Status](https://api.netlify.com/api/v1/badges/344d01a9-47c9-4c47-bbd1-1d258fe15295/deploy-status)](https://app.netlify.com/sites/brendonpedro/deploys)
