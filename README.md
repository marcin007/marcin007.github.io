# marcin007.github.io

[![CI](https://github.com/marcin007/marcin007.github.io/actions/workflows/ci.yml/badge.svg)](https://github.com/marcin007/marcin007.github.io/actions/workflows/ci.yml)
[![Deploy to GitHub Pages](https://github.com/marcin007/marcin007.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/marcin007/marcin007.github.io/actions/workflows/deploy.yml)

Personal portfolio — bilingual (EN/PL), dark/light, built with **Astro + TypeScript**.
Live at https://marcin007.github.io/ (EN) and https://marcin007.github.io/pl/ (PL).

Design direction: *terminal / deploy-log* — monospace accents, a command-line top bar,
and an experience timeline styled like a git history.

## Develop

```bash
npm install
npm run dev        # http://localhost:4321
```

## Scripts

- `npm run build` — static build into `dist/`
- `npm run preview` — preview the production build locally
- `npm run check` — TypeScript / Astro diagnostics
- `npm run check:content` — verify every string has both EN and PL
- `npm run check:build` — verify the built HTML (run after `build`)

## Content

All copy lives in `src/data/content.json` as `{ "en": …, "pl": … }` pairs — edit both
languages in one place. Types are in `src/types.ts`; the `L()` / `t()` helpers in
`src/i18n.ts` pick the language. Each section is a component in `src/components/`;
the two routes (`src/pages/index.astro`, `src/pages/pl/index.astro`) render the same
`<Sections>` with a different `lang`.

## Deploy

Pushing to `master` triggers `.github/workflows/deploy.yml`, which builds with Astro
and publishes to GitHub Pages. Pull requests and non-`master` pushes run
`.github/workflows/ci.yml` so build failures show up before merge.

If the Pages deploy workflow fails, `.github/workflows/retry-deploy.yml` reruns the failed
jobs once using GitHub CLI. A second failure remains red so the logs can be inspected and
fixed instead of looping forever.

**One-time setup:** GitHub → repo **Settings → Pages → Build and deployment →
Source: GitHub Actions**.

## Assets still to add (currently placeholders)

- Profile photo (hero), 4 certification badges, and the university crest — drop the
  files into `src/` and swap the `<Placeholder>` elements for `astro:assets` `<Image>`.
- Real GitHub URL and per-badge Credly links in `src/data/content.json`
  (`profile.links`, `certs[].url`).

## Adding animations later

The structure is ready for motion: `prefers-reduced-motion` is already honored, and
client behavior lives in small component `<script>`s (e.g. the theme toggle in
`Nav.astro`). Add richer effects as scripts or, for React-based work, run
`npx astro add react` and build them as islands.
