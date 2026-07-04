# Portfolio (Astro + TypeScript) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Faithfully port the `handoff/index.html` prototype into a deployable Astro + TypeScript site (bilingual PL/EN via two routes, dark/light theme, self-hosted fonts, placeholder images) published to GitHub Pages.

**Architecture:** A static Astro site (`output: 'static'`, default). One bilingual `content.json` is the single source of truth; a `L()/t()` helper localizes strings. Each prototype section becomes a small `.astro` component receiving a `lang` prop. Two thin pages (`/` = EN, `/pl/` = PL) compose the same `<Sections>` inside a shared `<Base>` layout. All CSS lives in one global stylesheet ported verbatim from the prototype. Theme is set before paint by an inline no-flash script and toggled client-side; language is chosen by route. Deploy is the official `withastro/action` on push to `master`.

**Tech Stack:** Astro 5, TypeScript (`astro check`), `@fontsource/ibm-plex-sans` + `-mono`, GitHub Actions + GitHub Pages. No UI framework in v1 (pure `.astro`); `@astrojs/react` can be added later for animation islands.

**Reference source of truth:** `handoff/index.html` (visual/behavior), `handoff/content.json` (data), `handoff/README.md` (tokens & data model). Spec: `docs/superpowers/specs/2026-07-02-portfolio-astro-design.md`.

**Porting recipe (applies to every section component).** Convert each `function x()` template string from `handoff/index.html` into an `.astro` component:
- `${L(o)}` → `{L(o, lang)}` · `${t('k')}` → `{t('k', lang)}` · `${expr}` → `{expr}`
- `.map(...).join('')` → `{arr.map((x) => ( ... ))}` (no `.join`)
- `${cond ? \`...\` : ''}` → `{cond && ( ... )}` (wrap multi-node blocks in `<Fragment>`)
- Keep **every** class name and inline `style="..."` exactly as in the prototype.
- `<image-slot ...>` → `<Placeholder class="..." label="..." />`
- Data comes from `import { content } from '../content'`; `lang` comes from `Astro.props`.

---

## Task 1: Project bootstrap

**Files:**
- Create: `.gitignore`, `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/env.d.ts`, `src/pages/index.astro` (temporary)
- Copy: `handoff/` (from the main repo) into the worktree

- [ ] **Step 1: Bring the handoff into the worktree**

The handoff lives in the main repo, not this worktree. Copy it in (source of truth for later steps):

```bash
cp -R /Users/mwojciechowski/IdeaProjects/marcin007.github.io/handoff ./handoff
ls handoff   # expect: README.md content.json image-slot.js index.html public
```

- [ ] **Step 2: Create `.gitignore`**

```
node_modules/
dist/
.astro/
.DS_Store
```

- [ ] **Step 3: Create `package.json`**

```json
{
  "name": "marcin-portfolio",
  "type": "module",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "check:content": "node scripts/check-content.mjs",
    "check:build": "node scripts/check-build.mjs"
  }
}
```

- [ ] **Step 4: Install dependencies**

```bash
npm install astro @fontsource/ibm-plex-sans @fontsource/ibm-plex-mono
npm install -D @astrojs/check typescript
```

Expected: installs without errors; `package-lock.json` is created (the deploy action needs it to detect npm).

- [ ] **Step 5: Create `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';

// User site served at the repo root (https://marcin007.github.io/) — no `base` needed.
export default defineConfig({
  site: 'https://marcin007.github.io',
});
```

- [ ] **Step 6: Create `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "resolveJsonModule": true
  }
}
```

- [ ] **Step 7: Create `src/env.d.ts`**

```ts
/// <reference types="astro/client" />
```

- [ ] **Step 8: Create a temporary `src/pages/index.astro` to prove the toolchain**

```astro
<!doctype html>
<html lang="en">
  <head><meta charset="utf-8" /><title>bootstrap</title></head>
  <body><h1>bootstrap ok</h1></body>
</html>
```

- [ ] **Step 9: Verify dev/build/typecheck**

```bash
npm run check   # expect: 0 errors, 0 warnings
npm run build   # expect: "Complete!" and a dist/index.html
```

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: bootstrap Astro + TS project and vendor the design handoff"
```

---

## Task 2: Content data, types, i18n helpers, content check

**Files:**
- Create: `src/data/content.json` (from handoff, one edit), `src/types.ts`, `src/content.ts`, `src/i18n.ts`, `scripts/check-content.mjs`

- [ ] **Step 1: Copy content.json and fix the CV path**

```bash
mkdir -p src/data public
cp handoff/content.json src/data/content.json
cp handoff/public/Marcin-Wojciechowski-CV.pdf public/Marcin-Wojciechowski-CV.pdf
touch public/.nojekyll   # harmless insurance so GitHub Pages never Jekyll-processes _astro/
```

Then edit `src/data/content.json`: change the `cv` value from `"public/Marcin-Wojciechowski-CV.pdf"` to an absolute path (files in `public/` are served from the site root, and the path must be correct from `/pl/` too):

```json
"cv": "/Marcin-Wojciechowski-CV.pdf",
```

- [ ] **Step 2: Create `src/types.ts`**

```ts
export type Localized = { en: string; pl: string };

export interface Highlight {
  title: Localized;
  problem: Localized;
  approach: Localized;
  impact: Localized;
}

export interface Job {
  company: string;
  hash: string;
  current: boolean;
  dot: string;
  role: Localized;
  period: string;
  periodEnd: Localized | null;
  context: Localized;
  highlights: Highlight[];
  points: Localized[];
  tech: string[];
}

export interface Cert {
  name: Localized;
  year: string;
  issuer: string;
  credly: boolean;
  url: string;
  badgeImage: string;
}

export interface Education {
  school: Localized;
  degreeTitle: Localized;
  field: Localized;
  location: Localized;
  year: string;
  crestImage: string;
}

export interface Metric {
  value: string;
  label: Localized;
}

export interface SkillGroup {
  label: Localized;
  items: string[];
}

export interface Profile {
  name: string;
  role: Localized;
  summary: Localized;
  email: string;
  phone: string;
  cv: string;
  links: { github: string; credly: string };
}

export interface Content {
  profile: Profile;
  ui: Record<string, Localized>;
  metrics: Metric[];
  skills: SkillGroup[];
  jobs: Job[];
  certs: Cert[];
  education: Education;
}
```

- [ ] **Step 3: Create `src/content.ts` (single typed content export)**

```ts
import data from './data/content.json';
import type { Content } from './types';

export const content = data as unknown as Content;
```

- [ ] **Step 4: Create `src/i18n.ts`**

```ts
import type { Localized } from './types';
import { content } from './content';

export type Lang = 'en' | 'pl';

export function L(value: Localized | string, lang: Lang): string {
  if (value && typeof value === 'object' && ('en' in value || 'pl' in value)) {
    return (value as Localized)[lang] ?? (value as Localized).en;
  }
  return value as string;
}

export function t(key: string, lang: Lang): string {
  return L(content.ui[key], lang);
}
```

- [ ] **Step 5: Write the content-integrity check (guards EN/PL stay in sync)**

Create `scripts/check-content.mjs`:

```js
import { readFileSync } from 'node:fs';

const data = JSON.parse(readFileSync(new URL('../src/data/content.json', import.meta.url), 'utf8'));
const errors = [];

const isLocalized = (v) => v && typeof v === 'object' && ('en' in v || 'pl' in v);

function walk(v, path) {
  if (isLocalized(v)) {
    for (const l of ['en', 'pl']) {
      if (typeof v[l] !== 'string' || v[l].trim() === '') errors.push(`${path}.${l} missing/empty`);
    }
    return;
  }
  if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${i}]`));
  else if (v && typeof v === 'object') for (const k of Object.keys(v)) walk(v[k], `${path}.${k}`);
}

walk(data, 'content');

if (errors.length) {
  console.error('Content check FAILED:\n' + errors.join('\n'));
  process.exit(1);
}
console.log('Content check passed: every localized string has non-empty en + pl.');
```

- [ ] **Step 6: Run the content check (should pass on the real content)**

```bash
npm run check:content   # expect: "Content check passed: ..."
```

- [ ] **Step 7: Typecheck**

```bash
npm run check   # expect: 0 errors
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add typed bilingual content, i18n helpers, and content-integrity check"
```

---

## Task 3: Design tokens, global stylesheet, base layout, fonts

**Files:**
- Create: `src/styles/global.css`, `src/layouts/Base.astro`
- Modify: `src/pages/index.astro` (use the layout)

- [ ] **Step 1: Create `src/styles/global.css`**

This is the prototype's `<style>` block (handoff/index.html lines 19–158) ported verbatim, with four deliberate changes: (a) theme token selectors move from `#app[data-theme]` to `:root[data-theme]` (theme now lives on `<html>`); (b) the old `#app{...}` base rules move to `body`; (c) image-slot placeholders get centering + label styles, and `#edu-crest` becomes `.edu-crest`; (d) the EN/PL segment now uses `<a>` links with `aria-current`; (e) a `prefers-reduced-motion` block disables the glow pulse and caret blink.

```css
/* ============================================================
   DESIGN TOKENS — palette from Marcin's CV
   amber #ffc700 · orange #ff9500 · deep navy #10192e
   Dark is default; [data-theme="light"] overrides. Theme lives on <html>.
   ============================================================ */
:root[data-theme="dark"]{
  --bg:#0b1120; --bg2:#10192e; --bg3:#16223c; --elev:#1c2c4d;
  --line:rgba(233,236,243,.10); --line2:rgba(233,236,243,.18);
  --txt:#f0f2f8; --txt2:#aeb7cc; --txt3:#7c88a3;
  --accent:#ffc700; --accentTx:#ffc700; --accent2:#ff9500; --onAccent:#10192e;
  --glow:rgba(255,199,0,.16); --chip:rgba(233,236,243,.06);
}
:root[data-theme="light"]{
  --bg:#f4f5f8; --bg2:#ffffff; --bg3:#ffffff; --elev:#ffffff;
  --line:rgba(16,25,46,.10); --line2:rgba(16,25,46,.16);
  --txt:#10192e; --txt2:#4a5468; --txt3:#8e8e93;
  --accent:#f0b400; --accentTx:#9a6a00; --accent2:#ff7a00; --onAccent:#10192e;
  --glow:rgba(240,180,0,.14); --chip:rgba(16,25,46,.05);
}

*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--txt);font-family:'IBM Plex Sans',system-ui,sans-serif;min-height:100vh;transition:background .25s,color .25s}
a{color:inherit}
.mono{font-family:'IBM Plex Mono',monospace}
.wrap{max-width:1200px;margin:0 auto}
section{scroll-margin-top:70px}

/* ---- Terminal top bar / nav ---- */
.nav{position:sticky;top:0;z-index:20;display:flex;align-items:center;gap:14px;padding:13px 22px;background:var(--bg2);border-bottom:1px solid var(--line);font-family:'IBM Plex Mono',monospace}
.dots{display:flex;gap:7px}
.dot{width:11px;height:11px;border-radius:50%}
.nav-links{margin-left:auto;display:flex;gap:4px;align-items:center;font-size:11.5px;flex-wrap:wrap;justify-content:flex-end}
.nav-links a{padding:5px 9px;border-radius:6px;color:var(--txt2);text-decoration:none}
.nav-links a:hover{background:var(--chip);color:var(--txt)}
.divider{width:1px;height:16px;background:var(--line2);margin:0 4px}
.seg{display:inline-flex;border:1px solid var(--line2);border-radius:7px;overflow:hidden}
.seg a{border:none;cursor:pointer;padding:5px 9px;font:600 11px 'IBM Plex Mono',monospace;background:transparent;color:var(--txt3);text-decoration:none}
.seg a[aria-current="page"]{background:var(--accent);color:var(--onAccent)}
.btn-ghost{border:1px solid var(--line2);cursor:pointer;padding:5px 10px;border-radius:7px;font:600 11px 'IBM Plex Mono',monospace;background:transparent;color:var(--txt2)}

/* ---- Buttons ---- */
.btn{display:inline-flex;align-items:center;gap:9px;padding:13px 22px;border-radius:10px;font:600 14px 'IBM Plex Sans',sans-serif;text-decoration:none;white-space:nowrap}
.btn-primary{background:var(--accent);color:var(--onAccent)}
.btn-outline{background:transparent;border:1px solid var(--line2);color:var(--txt)}

/* ---- Hero ---- */
.hero{padding:52px 44px 44px;display:grid;grid-template-columns:1.38fr 1fr;gap:44px;align-items:stretch}
.pill{display:inline-flex;align-items:center;gap:8px;padding:6px 12px;border-radius:99px;background:var(--chip);border:1px solid var(--line);font:500 12px 'IBM Plex Mono',monospace;color:var(--txt2)}
.status-dot{width:8px;height:8px;border-radius:50%;background:#28c840;box-shadow:0 0 0 3px rgba(40,200,64,.18)}
.kicker{font:500 13px 'IBM Plex Mono',monospace;color:var(--accentTx);letter-spacing:.04em;margin:22px 0 10px}
h1{font-size:52px;line-height:1.02;font-weight:700;letter-spacing:-.02em;margin:0 0 20px}
.lede{font-size:16px;line-height:1.7;color:var(--txt2);max-width:56ch;margin:0 0 26px}
.contact-card{margin-top:24px;border:1px solid var(--line);border-radius:11px;background:var(--bg2);padding:16px 18px}
.contact-grid{display:grid;grid-template-columns:64px 1fr;gap:9px 14px;font:500 13px 'IBM Plex Mono',monospace}
.contact-grid a{color:var(--txt);text-decoration:none}
.contact-grid a:hover{color:var(--accentTx)}
.photo-frame{border:1px solid var(--line);border-radius:14px;overflow:hidden;background:var(--bg2);display:flex;flex-direction:column;min-height:500px}
.frame-bar{display:flex;align-items:center;gap:8px;padding:11px 14px;border-bottom:1px solid var(--line);font:500 11.5px 'IBM Plex Mono',monospace;color:var(--txt3);flex:none}

/* ---- Image placeholders (swap for <Image> when assets arrive; marked data-image-slot) ---- */
.img-slot-label{font-size:11px;letter-spacing:.04em;text-align:center;padding:8px}
.photo-slot{flex:1;width:100%;min-height:440px;display:flex;align-items:center;justify-content:center;color:var(--txt3);background:radial-gradient(circle at 50% 38%, var(--elev), var(--bg2))}

/* ---- Metrics band ---- */
.metrics{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid var(--line)}
.metric{padding:28px 44px;border-right:1px solid var(--line)}
.metric .val{font:700 42px 'IBM Plex Mono',monospace;color:var(--accentTx);letter-spacing:-.02em;line-height:1}
.metric .lbl{font:500 11px 'IBM Plex Mono',monospace;letter-spacing:.09em;text-transform:uppercase;color:var(--txt3);margin-top:11px}

/* ---- Generic section ---- */
.sec{padding:44px 44px;border-top:1px solid var(--line)}
.sec-eyebrow{font:500 12px 'IBM Plex Mono',monospace;color:var(--accentTx);letter-spacing:.04em}
.sec-title{font-size:28px;font-weight:700;letter-spacing:-.01em;margin:8px 0 24px}

/* ---- Skills ---- */
.skills-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
.skill-card{padding:18px;border-radius:12px;background:var(--bg2);border:1px solid var(--line)}
.skill-card h3{font:600 12px 'IBM Plex Mono',monospace;color:var(--txt3);margin:0 0 12px}
.chips{display:flex;flex-wrap:wrap;gap:7px}
.chip{padding:5px 11px;border-radius:7px;background:var(--chip);font:500 12.5px 'IBM Plex Mono',monospace;color:var(--txt)}

/* ---- Certifications ---- */
.certs-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:22px}
.cert{display:flex;flex-direction:column;align-items:center;text-align:center;gap:16px}
.badge-wrap{position:relative;width:100%;aspect-ratio:1;display:flex;align-items:center;justify-content:center}
.badge-glow{position:absolute;inset:6px;border-radius:50%;background:radial-gradient(circle at 50% 42%, var(--glow) 0%, transparent 66%);filter:blur(10px);animation:glowPulse 3.6s ease-in-out infinite}
.badge-slot{position:relative;z-index:1;display:flex;align-items:center;justify-content:center;color:var(--txt3);width:100%;height:auto;aspect-ratio:1;border:1px solid var(--line2);border-radius:16px;background:radial-gradient(circle at 50% 40%, var(--elev), var(--bg2))}
.cert h3{font-size:13.5px;font-weight:600;line-height:1.35;margin:0}
.cert .meta{font:500 11.5px 'IBM Plex Mono',monospace;color:var(--txt3)}
.cert a{font:600 11.5px 'IBM Plex Mono',monospace;color:var(--accent2);text-decoration:none}
@keyframes glowPulse{0%,100%{opacity:.45;transform:scale(1)}50%{opacity:1;transform:scale(1.07)}}

/* ---- Education diploma card ---- */
.edu{margin-top:36px;position:relative;border:1px solid var(--line2);border-radius:16px;overflow:hidden;background:linear-gradient(135deg,var(--bg2),var(--bg3))}
.edu-top{height:3px;background:linear-gradient(90deg,var(--accent),var(--accent2))}
.edu-body{display:grid;grid-template-columns:auto 1fr auto;gap:30px;align-items:center;padding:30px 32px}
.edu-crest-wrap{position:relative;width:108px;height:108px;display:flex;align-items:center;justify-content:center;flex:none}
.edu-crest-glow{position:absolute;inset:2px;border-radius:50%;background:radial-gradient(circle,var(--glow),transparent 68%);filter:blur(9px);animation:glowPulse 3.8s ease-in-out infinite}
.edu-crest{position:relative;z-index:1;display:flex;align-items:center;justify-content:center;color:var(--txt3);width:108px;height:108px;border-radius:50%;border:1px solid var(--line2);background:radial-gradient(circle at 50% 40%,var(--elev),var(--bg2))}
.edu-year{text-align:center;padding-left:28px;border-left:1px solid var(--line);flex:none}
.corner{position:absolute;width:14px;height:14px}
.corner.tl{left:16px;top:19px;border-left:1px solid var(--line2);border-top:1px solid var(--line2)}
.corner.br{right:16px;bottom:16px;border-right:1px solid var(--line2);border-bottom:1px solid var(--line2)}

/* ---- Experience timeline ---- */
.job{display:grid;grid-template-columns:150px 1fr;gap:22px;position:relative;padding-bottom:34px}
.job-rail{position:relative}
.job-node{width:13px;height:13px;border-radius:50%;background:var(--bg);flex:none;z-index:1}
.job-line{position:absolute;left:6px;top:16px;bottom:-34px;width:1px;background:var(--line2)}
.job-card{border:1px solid var(--line);border-radius:14px;background:var(--bg2);padding:22px 24px}
.job-tag{padding:3px 9px;border-radius:99px;background:var(--glow);color:var(--accentTx);font:600 10.5px 'IBM Plex Mono',monospace;text-transform:uppercase;letter-spacing:.05em}
.tech-row{display:flex;flex-wrap:wrap;gap:6px;margin:14px 0 16px}
.tech{padding:3px 9px;border-radius:6px;border:1px solid var(--line2);font:500 11px 'IBM Plex Mono',monospace;color:var(--txt2)}
.hl-label{font:600 11px 'IBM Plex Mono',monospace;color:var(--txt3);text-transform:uppercase;letter-spacing:.08em}
.hl{border-left:2px solid var(--accent);padding:2px 0 2px 16px}
.hl-title{font-size:14.5px;font-weight:600;margin-bottom:9px}
.hl-grid{display:grid;grid-template-columns:74px 1fr;gap:5px 12px;font-size:13px;line-height:1.55}
.hl-k{font:600 11px 'IBM Plex Mono',monospace;padding-top:2px}
.points{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:8px}
.points li{display:flex;gap:10px;font-size:13.5px;line-height:1.55;color:var(--txt2)}
.points .mk{color:var(--accentTx);font-family:'IBM Plex Mono',monospace}

/* ---- Contact ---- */
.contact-panel{border:1px solid var(--line);border-radius:14px;overflow:hidden;background:var(--bg2)}
.blink{animation:blink 1.1s step-end infinite;color:var(--accentTx)}
@keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}
.links-row{display:flex;gap:22px;flex-wrap:wrap;font:500 13px 'IBM Plex Mono',monospace;color:var(--txt2)}
.links-row a{color:var(--accent2);text-decoration:none}
footer{text-align:center;font:400 11.5px 'IBM Plex Mono',monospace;color:var(--txt3);padding:26px}

/* ---- Reduced motion ---- */
@media (prefers-reduced-motion: reduce){
  .badge-glow,.edu-crest-glow{animation:none}
  .blink{animation:none}
  html{scroll-behavior:auto}
}

/* ---- Responsive ---- */
@media (max-width:900px){
  .hero{grid-template-columns:1fr;gap:28px;padding:36px 22px}
  .photo-frame{min-height:360px}
  .metrics{grid-template-columns:repeat(2,1fr)}
  .metric{padding:22px}
  .sec{padding:34px 22px}
  .skills-grid{grid-template-columns:1fr}
  .certs-grid{grid-template-columns:repeat(2,1fr)}
  .edu-body{grid-template-columns:1fr;text-align:center;justify-items:center}
  .edu-year{padding-left:0;border-left:none;border-top:1px solid var(--line);padding-top:16px}
  .job{grid-template-columns:1fr}
  .job-rail{display:flex;align-items:center;gap:10px}
  .job-line{display:none}
  h1{font-size:38px}
}
```

- [ ] **Step 2: Create `src/layouts/Base.astro`**

```astro
---
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/600.css';
import '@fontsource/ibm-plex-sans/700.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-mono/600.css';
import '../styles/global.css';
import type { Lang } from '../i18n';

interface Props {
  lang: Lang;
  title: string;
  description: string;
}
const { lang, title, description } = Astro.props;
---

<!doctype html>
<html lang={lang} data-theme="dark">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <!-- No-flash theme: set before first paint from localStorage (falls back to dark). -->
    <script is:inline>
      (function () {
        try {
          document.documentElement.dataset.theme = localStorage.getItem('mw_theme') || 'dark';
        } catch (e) {
          document.documentElement.dataset.theme = 'dark';
        }
      })();
    </script>
  </head>
  <body>
    <slot />
  </body>
</html>
```

- [ ] **Step 3: Replace `src/pages/index.astro` to render through the layout**

```astro
---
import Base from '../layouts/Base.astro';
import { content } from '../content';
import { L } from '../i18n';

const lang = 'en' as const;
const title = `${content.profile.name} — ${L(content.profile.role, lang)}`;
const description = L(content.profile.summary, lang);
---

<Base lang={lang} title={title} description={description}>
  <main style="padding:44px">
    <h1>{content.profile.name}</h1>
    <p class="lede">{L(content.profile.summary, lang)}</p>
  </main>
</Base>
```

- [ ] **Step 4: Typecheck and build**

```bash
npm run check   # expect: 0 errors
npm run build   # expect: Complete!
```

- [ ] **Step 5: Visual smoke test (human checkpoint)**

```bash
npm run dev   # open http://localhost:4321/
```
Expect: dark navy background (`#0b1120`), IBM Plex fonts loaded (no system-font flash), amber heading accent. Stop the server when done.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add global tokens/styles, base layout, self-hosted fonts, no-flash theme"
```

---

## Task 4: Placeholder component

**Files:**
- Create: `src/components/Placeholder.astro`

- [ ] **Step 1: Create `src/components/Placeholder.astro`**

```astro
---
interface Props {
  class?: string;
  label?: string;
  id?: string;
}
const { class: className, label = '', id } = Astro.props;
---

<div class={className} id={id} data-image-slot>
  <span class="img-slot-label mono">{label}</span>
</div>
```

- [ ] **Step 2: Typecheck**

```bash
npm run check   # expect: 0 errors
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add reusable image Placeholder component"
```

---

## Task 5: Nav (terminal top bar, theme toggle, language segment)

**Files:**
- Create: `src/components/Nav.astro`

Ports `nav()` (handoff/index.html lines 377–395). The language segment becomes two `<a>` links (`aria-current` marks the active one); the theme button's label is set client-side (the server can't know localStorage).

- [ ] **Step 1: Create `src/components/Nav.astro`**

```astro
---
import { t, type Lang } from '../i18n';

interface Props {
  lang: Lang;
}
const { lang } = Astro.props;
---

<div class="nav">
  <div class="dots">
    <span class="dot" style="background:#ff5f57"></span>
    <span class="dot" style="background:#febc2e"></span>
    <span class="dot" style="background:#28c840"></span>
  </div>
  <span class="mono" style="font-size:12.5px;color:var(--txt2)">marcin@portfolio<span style="color:var(--accentTx)"> ~ </span>./whoami</span>
  <nav class="nav-links">
    <a href="#skills">{t('skills', lang)}</a>
    <a href="#certs">{t('certs', lang)}</a>
    <a href="#experience">{t('experience', lang)}</a>
    <a href="#contact">{t('contact', lang)}</a>
    <span class="divider"></span>
    <span class="seg">
      <a href="/" aria-current={lang === 'en' ? 'page' : undefined}>EN</a>
      <a href="/pl/" aria-current={lang === 'pl' ? 'page' : undefined}>PL</a>
    </span>
    <button class="btn-ghost" id="theme-toggle" aria-label="Toggle theme">◐ <span class="theme-label"></span></button>
  </nav>
</div>

<script>
  const btn = document.getElementById('theme-toggle');
  const label = btn?.querySelector('.theme-label');
  const sync = () => {
    if (label) label.textContent = document.documentElement.dataset.theme === 'dark' ? 'Light' : 'Dark';
  };
  sync();
  btn?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('mw_theme', next); } catch (e) { /* ignore */ }
    sync();
  });
</script>
```

- [ ] **Step 2: Temporarily render Nav to smoke-test it** — in `src/pages/index.astro`, add `import Nav from '../components/Nav.astro';` and place `<Nav lang={lang} />` at the top of `<Base>`'s slot (above `<main>`). This is scaffolding; Task 12 finalizes page composition.

- [ ] **Step 3: Typecheck, build, visual**

```bash
npm run check   # expect: 0 errors
npm run build   # expect: Complete!
npm run dev     # open http://localhost:4321/
```
Expect: sticky terminal bar; three traffic dots; `marcin@portfolio ~ ./whoami`; nav anchors; EN highlighted (amber) in the segment; a `◐ Light` theme button that, when clicked, flips the whole page to light and persists across reload. Stop the server.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add terminal nav with client theme toggle and language segment"
```

---

## Task 6: Hero

**Files:**
- Create: `src/components/Hero.astro`

Ports `hero()` (handoff/index.html lines 398–424). Email is `mailto:`, phone is `tel:` with spaces stripped, CV is a real download.

- [ ] **Step 1: Create `src/components/Hero.astro`**

```astro
---
import { content } from '../content';
import { L, t, type Lang } from '../i18n';
import Placeholder from './Placeholder.astro';

interface Props {
  lang: Lang;
}
const { lang } = Astro.props;
const p = content.profile;
const telHref = 'tel:' + p.phone.replace(/\s/g, '');
---

<section class="hero wrap" id="top">
  <div>
    <span class="pill"><span class="status-dot"></span>{t('available', lang)}</span>
    <div class="kicker">{L(p.role, lang)}</div>
    <h1>{p.name}</h1>
    <p class="lede">{L(p.summary, lang)}</p>
    <div style="display:flex;gap:12px;flex-wrap:wrap">
      <a class="btn btn-primary" href={p.cv} download>↓ {t('downloadCV', lang)}</a>
      <a class="btn btn-outline" href="#contact">{t('getInTouch', lang)}</a>
    </div>
    <div class="contact-card">
      <div class="mono" style="font-size:12px;color:var(--txt3);margin-bottom:12px">$ cat contact.txt</div>
      <div class="contact-grid">
        <span style="color:var(--accentTx)">email</span><a href={`mailto:${p.email}`}>{p.email}</a>
        <span style="color:var(--accentTx)">phone</span><a href={telHref}>{p.phone}</a>
      </div>
    </div>
  </div>
  <div class="photo-frame">
    <div class="frame-bar">
      <span class="dot" style="background:#ff5f57"></span>
      <span class="dot" style="background:#febc2e"></span>
      <span class="dot" style="background:#28c840"></span>
      <span style="margin-left:6px">~/marcin.jpg</span>
    </div>
    <Placeholder class="photo-slot" label="photo" />
  </div>
</section>
```

- [ ] **Step 2: Render it** — in `src/pages/index.astro`, import Hero and place `<Hero lang={lang} />` below `<Nav />`; remove the temporary `<main>` block.

- [ ] **Step 3: Typecheck, build, visual**

```bash
npm run check && npm run build
npm run dev   # http://localhost:4321/
```
Expect: two-column hero; "Open to opportunities" pill with green dot; big name; CV + "Get in touch" buttons; `$ cat contact.txt` block with clickable `mailto:` / `tel:`; right-side photo frame with window chrome and a "photo" placeholder. Stop the server.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add hero section"
```

---

## Task 7: Metrics band

**Files:**
- Create: `src/components/Metrics.astro`

Ports `metrics()` (handoff/index.html lines 427–430).

- [ ] **Step 1: Create `src/components/Metrics.astro`**

```astro
---
import { content } from '../content';
import { L, type Lang } from '../i18n';

interface Props {
  lang: Lang;
}
const { lang } = Astro.props;
---

<div class="metrics wrap">
  {content.metrics.map((m) => (
    <div class="metric">
      <div class="val">{m.value}</div>
      <div class="lbl">{L(m.label, lang)}</div>
    </div>
  ))}
</div>
```

- [ ] **Step 2: Render it** in `src/pages/index.astro` below `<Hero />`, then:

```bash
npm run check && npm run build   # expect: 0 errors, Complete!
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add metrics band"
```

---

## Task 8: Skills

**Files:**
- Create: `src/components/Skills.astro`

Ports `skills()` (handoff/index.html lines 433–444).

- [ ] **Step 1: Create `src/components/Skills.astro`**

```astro
---
import { content } from '../content';
import { L, t, type Lang } from '../i18n';

interface Props {
  lang: Lang;
}
const { lang } = Astro.props;
---

<section class="sec wrap" id="skills">
  <div class="sec-eyebrow">// stack</div>
  <h2 class="sec-title">{t('skills', lang)}</h2>
  <div class="skills-grid">
    {content.skills.map((s) => (
      <div class="skill-card">
        <h3>{L(s.label, lang)}</h3>
        <div class="chips">{s.items.map((i) => <span class="chip">{i}</span>)}</div>
      </div>
    ))}
  </div>
</section>
```

- [ ] **Step 2: Render it** in `src/pages/index.astro` below `<Metrics />`, then:

```bash
npm run check && npm run build   # expect: 0 errors, Complete!
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add skills section"
```

---

## Task 9: Certifications + Education

**Files:**
- Create: `src/components/Education.astro`, `src/components/Certifications.astro`

Ports `certs()` (handoff/index.html lines 447–490). The education "diploma" card is split into its own component.

- [ ] **Step 1: Create `src/components/Education.astro`**

```astro
---
import { content } from '../content';
import { L, t, type Lang } from '../i18n';
import Placeholder from './Placeholder.astro';

interface Props {
  lang: Lang;
}
const { lang } = Astro.props;
const e = content.education;
---

<div class="edu">
  <div class="edu-top"></div>
  <span class="corner tl"></span><span class="corner br"></span>
  <div class="edu-body">
    <div class="edu-crest-wrap">
      <div class="edu-crest-glow"></div>
      <Placeholder class="edu-crest" label="logo" />
    </div>
    <div>
      <div class="mono" style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--accentTx);margin-bottom:11px">{t('education', lang)}</div>
      <div style="font-size:22px;font-weight:700;letter-spacing:-.01em;line-height:1.15">{L(e.school, lang)}</div>
      <div style="font-size:14.5px;color:var(--txt2);margin-top:7px">{L(e.degreeTitle, lang)} · {L(e.field, lang)}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:15px">
        <span class="pill"><span style="width:6px;height:6px;border-radius:50%;background:var(--accent2)"></span>{L(e.location, lang)}</span>
      </div>
    </div>
    <div class="edu-year">
      <div style="font:700 42px 'IBM Plex Mono',monospace;color:var(--accentTx);letter-spacing:-.02em;line-height:1">{e.year}</div>
      <div class="mono" style="font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--txt3);margin-top:9px">{t('graduated', lang)}</div>
    </div>
  </div>
</div>
```

- [ ] **Step 2: Create `src/components/Certifications.astro`**

```astro
---
import { content } from '../content';
import { L, t, type Lang } from '../i18n';
import Placeholder from './Placeholder.astro';
import Education from './Education.astro';

interface Props {
  lang: Lang;
}
const { lang } = Astro.props;
---

<section class="sec wrap" id="certs">
  <div class="sec-eyebrow">// credentials</div>
  <h2 class="sec-title" style="margin-bottom:4px">{t('certs', lang)}</h2>
  <p class="mono" style="font-size:12.5px;color:var(--txt3);margin:0 0 30px">// {t('badgeHint', lang)}</p>
  <div class="certs-grid">
    {content.certs.map((c) => (
      <div class="cert">
        <div class="badge-wrap">
          <div class="badge-glow"></div>
          <Placeholder class="badge-slot" label="badge" />
        </div>
        <div style="display:flex;flex-direction:column;gap:6px">
          <h3>{L(c.name, lang)}</h3>
          <div class="meta">{c.issuer} · {c.year}</div>
          {c.credly && <a href={c.url} target="_blank" rel="noopener">{t('viewCred', lang)} ↗</a>}
        </div>
      </div>
    ))}
  </div>
  <Education lang={lang} />
</section>
```

- [ ] **Step 3: Render it** in `src/pages/index.astro` below `<Skills />`, then:

```bash
npm run check && npm run build
npm run dev   # verify 4 glowing badge tiles + diploma card; stop server
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add certifications and education card"
```

---

## Task 10: Experience timeline

**Files:**
- Create: `src/components/JobCard.astro`, `src/components/Experience.astro`

Ports `experience()` (handoff/index.html lines 493–533). Each job is a `JobCard`; the Problem→Approach→Impact block renders only when `highlights` is non-empty.

- [ ] **Step 1: Create `src/components/JobCard.astro`**

```astro
---
import { L, t, type Lang } from '../i18n';
import type { Job } from '../types';

interface Props {
  job: Job;
  lang: Lang;
}
const { job, lang } = Astro.props;
---

<div class="job">
  <div class="job-rail">
    <div style="display:flex;align-items:center;gap:9px">
      <span class="job-node" style={`border:3px solid ${job.dot}`}></span>
      <span class="mono" style="font-size:12px;color:var(--txt3)">{job.hash}</span>
    </div>
    <div class="mono" style="font-size:12px;color:var(--txt2);margin:10px 0 0 22px">{job.period}<span style="color:var(--accentTx)">{job.periodEnd ? L(job.periodEnd, lang) : ''}</span></div>
    <div class="job-line"></div>
  </div>
  <div class="job-card">
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
      <span style="font-size:20px;font-weight:700;letter-spacing:-.01em">{job.company}</span>
      <span style="color:var(--txt3)">/</span>
      <span style="font-size:15px;color:var(--txt2)">{L(job.role, lang)}</span>
      {job.current && <span class="job-tag">● {t('present', lang)}</span>}
    </div>
    <div class="tech-row">{job.tech.map((x) => <span class="tech">{x}</span>)}</div>
    <p style="font-size:14px;line-height:1.65;color:var(--txt2);margin:0">{L(job.context, lang)}</p>
    {job.highlights && job.highlights.length > 0 && (
      <Fragment>
        <div class="hl-label" style="margin:22px 0 12px">{t('keyAchievements', lang)}</div>
        <div style="display:flex;flex-direction:column;gap:12px">
          {job.highlights.map((h) => (
            <div class="hl">
              <div class="hl-title">{L(h.title, lang)}</div>
              <div class="hl-grid">
                <span class="hl-k" style="color:#ff5f57">{t('problem', lang)}</span><span style="color:var(--txt2)">{L(h.problem, lang)}</span>
                <span class="hl-k" style="color:var(--accent2)">{t('approach', lang)}</span><span style="color:var(--txt2)">{L(h.approach, lang)}</span>
                <span class="hl-k" style="color:#28c840">{t('impact', lang)}</span><span style="color:var(--txt);font-weight:500">{L(h.impact, lang)}</span>
              </div>
            </div>
          ))}
        </div>
      </Fragment>
    )}
    <div class="hl-label" style="margin:20px 0 10px">{t('coreScope', lang)}</div>
    <ul class="points">{job.points.map((pt) => <li><span class="mk">▸</span><span>{L(pt, lang)}</span></li>)}</ul>
  </div>
</div>
```

- [ ] **Step 2: Create `src/components/Experience.astro`**

```astro
---
import { content } from '../content';
import { t, type Lang } from '../i18n';
import JobCard from './JobCard.astro';

interface Props {
  lang: Lang;
}
const { lang } = Astro.props;
---

<section class="sec wrap" id="experience">
  <div class="sec-eyebrow mono">$ git log --oneline --all</div>
  <h2 class="sec-title">{t('experience', lang)}</h2>
  {content.jobs.map((job) => <JobCard job={job} lang={lang} />)}
</section>
```

- [ ] **Step 3: Render it** in `src/pages/index.astro` below `<Certifications />`, then:

```bash
npm run check && npm run build
npm run dev   # verify timeline; Mercedes (amber node + Present tag) and Volkswagen show P/A/I blocks; stop server
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add experience timeline"
```

---

## Task 11: Contact panel + footer

**Files:**
- Create: `src/components/Contact.astro`

Ports `contact()` (handoff/index.html lines 536–560).

- [ ] **Step 1: Create `src/components/Contact.astro`**

```astro
---
import { content } from '../content';
import { t, type Lang } from '../i18n';

interface Props {
  lang: Lang;
}
const { lang } = Astro.props;
const p = content.profile;
---

<section class="sec wrap" id="contact">
  <div class="contact-panel">
    <div class="frame-bar">
      <span class="dot" style="background:#ff5f57"></span>
      <span class="dot" style="background:#febc2e"></span>
      <span class="dot" style="background:#28c840"></span>
      <span style="margin-left:6px">contact.sh</span>
    </div>
    <div style="padding:30px 28px">
      <div class="mono" style="font-size:13px;color:var(--txt3);margin-bottom:6px">$ ./contact.sh<span class="blink">_</span></div>
      <h2 style="font-size:30px;font-weight:700;letter-spacing:-.01em;margin:0 0 8px">{t('contact', lang)}</h2>
      <p style="font-size:15px;line-height:1.6;color:var(--txt2);max-width:52ch;margin:0 0 24px">{t('contactSub', lang)}</p>
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:22px">
        <a class="btn btn-primary" href={p.cv} download>↓ {t('downloadCV', lang)}</a>
        <a class="btn btn-outline" href={`mailto:${p.email}`}>✉ {p.email}</a>
      </div>
      <div class="links-row">
        <span><span style="color:var(--txt3)">tel</span> {p.phone}</span>
        <a href={p.links.github}>GitHub ↗</a>
        <a href={p.links.credly} target="_blank" rel="noopener">Credly ↗</a>
      </div>
    </div>
  </div>
  <footer>© 2026 {p.name} — built with care</footer>
</section>
```

- [ ] **Step 2: Render it** in `src/pages/index.astro` below `<Experience />`, then:

```bash
npm run check && npm run build   # expect: 0 errors, Complete!
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add contact panel and footer"
```

---

## Task 12: Assemble pages (EN + PL) and behavior checks

**Files:**
- Create: `src/components/Sections.astro`, `src/pages/pl/index.astro`, `scripts/check-build.mjs`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create `src/components/Sections.astro` (single composition, DRY across both routes)**

```astro
---
import Nav from './Nav.astro';
import Hero from './Hero.astro';
import Metrics from './Metrics.astro';
import Skills from './Skills.astro';
import Certifications from './Certifications.astro';
import Experience from './Experience.astro';
import Contact from './Contact.astro';
import type { Lang } from '../i18n';

interface Props {
  lang: Lang;
}
const { lang } = Astro.props;
---

<Nav lang={lang} />
<Hero lang={lang} />
<Metrics lang={lang} />
<Skills lang={lang} />
<Certifications lang={lang} />
<Experience lang={lang} />
<Contact lang={lang} />
```

- [ ] **Step 2: Replace `src/pages/index.astro` (EN) with the final version**

```astro
---
import Base from '../layouts/Base.astro';
import Sections from '../components/Sections.astro';
import { content } from '../content';
import { L } from '../i18n';

const lang = 'en' as const;
const title = `${content.profile.name} — ${L(content.profile.role, lang)}`;
const description = L(content.profile.summary, lang);
---

<Base lang={lang} title={title} description={description}>
  <Sections lang={lang} />
</Base>
```

- [ ] **Step 3: Create `src/pages/pl/index.astro` (PL)**

```astro
---
import Base from '../../layouts/Base.astro';
import Sections from '../../components/Sections.astro';
import { content } from '../../content';
import { L } from '../../i18n';

const lang = 'pl' as const;
const title = `${content.profile.name} — ${L(content.profile.role, lang)}`;
const description = L(content.profile.summary, lang);
---

<Base lang={lang} title={title} description={description}>
  <Sections lang={lang} />
</Base>
```

- [ ] **Step 4: Write the build-output behavior check (write it first, then build to satisfy it)**

Create `scripts/check-build.mjs`:

```js
import { readFileSync } from 'node:fs';

const read = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');
const en = read('../dist/index.html');
const pl = read('../dist/pl/index.html');

const fail = [];
const must = (cond, msg) => { if (!cond) fail.push(msg); };

must(en.includes('Marcin Wojciechowski'), 'EN: name missing');
must(pl.includes('Marcin Wojciechowski'), 'PL: name missing');
must(en.includes('mailto:marcinwojciechowski7@icloud.com'), 'EN: mailto missing');
must(en.includes('tel:+48507705977'), 'EN: tel href must have spaces stripped');
must(en.includes('/Marcin-Wojciechowski-CV.pdf'), 'EN: CV link missing/wrong path');
must(/rel="noopener"/.test(en), 'EN: external link rel="noopener" missing');
must(en.includes('Experience'), 'EN: nav label "Experience" missing');
must(pl.includes('Doświadczenie'), 'PL: nav label "Doświadczenie" missing');
for (const id of ['id="skills"', 'id="certs"', 'id="experience"', 'id="contact"']) {
  must(en.includes(id), `EN: anchor ${id} missing`);
  must(pl.includes(id), `PL: anchor ${id} missing`);
}

if (fail.length) {
  console.error('Build check FAILED:\n' + fail.join('\n'));
  process.exit(1);
}
console.log('Build check passed: routes, i18n, links, and anchors all present.');
```

- [ ] **Step 5: Build and run all checks**

```bash
npm run check          # expect: 0 errors
npm run check:content  # expect: content check passed
npm run build          # expect: builds dist/index.html and dist/pl/index.html
npm run check:build    # expect: Build check passed
```

- [ ] **Step 6: Visual parity check (human checkpoint)**

```bash
npm run preview   # open http://localhost:4321/ and http://localhost:4321/pl/
```
Open `handoff/index.html` in another tab. Verify `/` matches the prototype in **dark and light**; verify `/pl/` shows Polish throughout; verify clicking EN/PL in the nav navigates between routes and the chosen theme persists across the switch. Stop the server.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: compose EN + PL pages and add build-output behavior check"
```

---

## Task 13: Deploy workflow, README, final verification

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `README.md`

- [ ] **Step 1: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ master ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v6
      - name: Build with Astro
        uses: withastro/action@v6

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v5
```

- [ ] **Step 2: Replace `README.md`**

```markdown
# marcin007.github.io

Personal portfolio — bilingual (EN/PL), dark/light, built with Astro + TypeScript.
Live at https://marcin007.github.io/ (EN) and https://marcin007.github.io/pl/ (PL).

## Develop

```bash
npm install
npm run dev        # http://localhost:4321
```

## Scripts

- `npm run build` — static build into `dist/`
- `npm run preview` — preview the production build
- `npm run check` — TypeScript / Astro diagnostics
- `npm run check:content` — verify every string has both EN and PL
- `npm run check:build` — verify the built HTML (run after `build`)

## Content

All copy lives in `src/data/content.json` as `{ "en": ..., "pl": ... }` pairs —
edit both languages in one place. Types are in `src/types.ts`.

## Deploy

Pushing to `master` triggers `.github/workflows/deploy.yml`, which builds and
publishes to GitHub Pages.

**One-time setup:** GitHub → repo **Settings → Pages → Build and deployment →
Source: GitHub Actions**.

## Assets still to add (currently placeholders)

- Profile photo (hero), 4 certification badges, university crest — drop files in
  `src/` and swap the `<Placeholder>` elements for `astro:assets` `<Image>`.
- Real GitHub URL and per-badge Credly links in `src/data/content.json`
  (`profile.links`, `certs[].url`).
```

(Note: keep the triple-backtick code fences intact when creating the file.)

- [ ] **Step 3: Full verification**

```bash
npm run check && npm run check:content && npm run build && npm run check:build
```
Expect all four to pass.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "ci: add GitHub Pages deploy workflow; document setup and remaining assets"
```

- [ ] **Step 5: Manual GitHub Pages source (human, one-time, after pushing)**

In the GitHub repo: **Settings → Pages → Build and deployment → Source → GitHub Actions**. Then push `master` (or run the workflow via *Actions → Deploy to GitHub Pages → Run workflow*) and confirm the site is live at `https://marcin007.github.io/`.

---

## Definition of done

- `npm run check`, `npm run check:content`, `npm run build`, `npm run check:build` all pass.
- `/` renders English and `/pl/` renders Polish; nav switches routes; theme toggles and persists (dark default, no flash).
- Visual parity with `handoff/index.html` in both themes; responsive single-column under ~900px; `prefers-reduced-motion` disables the glow pulse and caret blink.
- Deploy workflow present; Pages source documented; placeholders and TODO URLs clearly marked for later.
```
