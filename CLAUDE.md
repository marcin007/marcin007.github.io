# CLAUDE.md — marcin007.github.io

Personal portfolio built with **Astro + TypeScript**, bilingual (EN/PL), deployed to
GitHub Pages. Two routes render the same components: `/` (EN) and `/pl/` (PL).
Design direction: *terminal / deploy-log* — monospace accents, dark default, amber accent.

## Local preview — REQUIRED after any viewable change

Whenever you make a change that shows up in the browser (a component, style, content, or
page), you MUST run it locally and hand the user a link before calling the change done:

1. **Start the dev server** (`npm run dev`, Astro HMR).
2. **Use the dedicated frontend preview port range `43110`–`43119`**. Start at `43110`,
   and if that one is taken, bump to the next free port in that range:
   ```bash
   npm run dev -- --host 127.0.0.1 --port 43110
   ```
   Do not use the default Astro ports (`4321`, `4322`) for agent-run previews; those may be
   occupied by Claude Code or another checkout.
3. **Always give the user a clickable localhost link** for the port you actually used
   (e.g. `http://localhost:43110`) so they can open it in their own external browser. State
   which port it's on.

Do not report a visual change as finished without that local link. HMR is on, so the user
can keep the tab open and watch edits live.

## Commands

- `npm run dev` — dev server with HMR. Append `-- --port <N>` to pick the port.
- `npm run build` — production build to `dist/` (also generates optimized `<Image>` assets).
- `npm run preview` — serve the built `dist/`.
- `npm run check` — Astro + TypeScript diagnostics.
- `npm run check:content` — assert every localized string has non-empty EN + PL.
- `npm run check:build` — assert routes, i18n, links, and anchors exist in the build output.

## Notes

- Images use `astro:assets` `<Image>` with static imports from `src/assets/` (optimized to
  WebP at build). The hero photo crop is tunable via CSS vars on `.photo-img`
  (`--photo-zoom` / `--photo-x` / `--photo-y`) in `src/styles/global.css`.
- All copy is bilingual via `src/data/content.json` (`{ en, pl }`) — never hardcode strings.
