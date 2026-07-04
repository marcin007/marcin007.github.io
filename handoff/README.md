# Marcin Wojciechowski — Portfolio · Developer Handoff

A production-ready spec + working reference prototype for a bilingual (PL/EN), dark/light
personal portfolio site. Design direction: **"terminal / deploy-log"** — monospace accents,
a command-line top bar, and an experience timeline styled like a git history.

> **Goal:** hand this folder to Claude Code and have it rebuild the design as a real,
> deployable website (recommended: **Next.js + TypeScript**).

---

## 1. What's in this folder

| File | Purpose |
|------|---------|
| `index.html` | **Working reference prototype** — the whole site in one vanilla HTML/CSS/JS file. Open it in a browser (double-click) to see and click the real thing. This is the source of truth for layout, tokens and behavior. |
| `content.json` | **All content**, structured and bilingual (`{ "en": …, "pl": … }`). Import this directly — do not retype the CV. |
| `image-slot.js` | The drag-and-drop image placeholder web component used for the photo, the 4 certification badges, and the university crest. Reference only — in the real app you'll likely swap these for `next/image` + an upload flow or static imports (see §6). |
| `public/Marcin-Wojciechowski-CV.pdf` | The CV, wired to every "Download CV" button. |

Open `index.html` first. Everything below describes how it's built.

---

## 2. Quick start (reference prototype)

```bash
# no build step — it's a single self-contained file
open index.html          # macOS
# or just double-click it
```

Toggles in the top bar: **EN / PL** language, **◐ Light/Dark** theme. Both persist to
`localStorage` (`mw_lang`, `mw_theme`). The photo / badge / crest tiles accept a dragged
image and persist it locally.

---

## 3. Recommended target stack

Marcin's own stack is Next.js + TypeScript, so:

- **Next.js (App Router) + TypeScript**
- **next-intl** or a tiny custom dictionary for PL/EN (content is already `{en,pl}`)
- **CSS Modules or Tailwind** — tokens in §4 map cleanly to either
- **next-themes** for dark/light with no flash
- Static export (`output: 'export'`) is fine — the site has no backend needs.

None of this is mandatory; the prototype is framework-agnostic. Match Marcin's preference.

---

## 4. Design tokens

Fonts (Google Fonts): **IBM Plex Sans** (400/500/600/700) for UI, **IBM Plex Mono**
(400/500/600) for all the terminal/label accents.

Palette is lifted from the CV. Dark is the default.

```
                 DARK              LIGHT
--bg             #0b1120           #f4f5f8      page background
--bg2            #10192e           #ffffff      cards / raised surfaces
--bg3            #16223c           #ffffff      gradient partner for bg2
--elev           #1c2c4d           #ffffff      slot / inset backgrounds
--line           rgba(233,236,243,.10)   rgba(16,25,46,.10)    hairline borders
--line2          rgba(233,236,243,.18)   rgba(16,25,46,.16)    stronger borders
--txt            #f0f2f8           #10192e      primary text
--txt2           #aeb7cc           #4a5468      secondary text
--txt3           #7c88a3           #8e8e93      muted / labels
--accent         #ffc700           #f0b400      amber — primary accent / CTA fill
--accentTx       #ffc700           #9a6a00      accent used as *text* (darker in light mode for contrast)
--accent2        #ff9500           #ff7a00      orange — links, secondary accent
--onAccent       #10192e           #10192e      text on amber fills
--glow           rgba(255,199,0,.16)     rgba(240,180,0,.14)   badge/edu glow
--chip           rgba(233,236,243,.06)   rgba(16,25,46,.05)    chip backgrounds
```

Note the deliberate split between `--accent` (fills) and `--accentTx` (text): pure `#ffc700`
text fails contrast on light backgrounds, so it darkens to `#9a6a00` in light mode. Keep this.

Other constants: card radius `14–16px`, chip radius `7–8px`, section padding `44px` desktop
/ `22–34px` mobile, max content width `1200px`. Semantic status colors used in the timeline:
red `#ff5f57` (Problem), orange `--accent2` (Approach), green `#28c840` (Impact).

---

## 5. Data model

`content.json` shape (TypeScript):

```ts
type Localized = { en: string; pl: string };

interface Content {
  profile: {
    name: string;
    role: Localized;
    summary: Localized;
    email: string;
    phone: string;              // display form, e.g. "+48 507 705 977"
    cv: string;                 // path to the PDF
    links: { github: string; credly: string };
  };
  ui: Record<string, Localized>;            // every interface string, keyed
  metrics: { value: string; label: Localized }[];
  skills: { label: Localized; items: string[] }[];
  jobs: {
    company: string;
    hash: string;               // fake short git hash, decorative
    current: boolean;           // renders the "Present" tag + amber node
    dot: string;                // timeline node color
    role: Localized;
    period: string;             // e.g. "04.2024 — "
    periodEnd: Localized | null;// e.g. { en:"Present", pl:"Obecnie" }
    context: Localized;         // paragraph
    highlights: {               // the Problem → Approach → Impact blocks
      title: Localized;
      problem: Localized;
      approach: Localized;
      impact: Localized;
    }[];                        // may be empty
    points: Localized[];        // "core scope" bullets
    tech: string[];             // tech tags
  }[];
  certs: {
    name: Localized; year: string; issuer: string;
    credly: boolean;            // whether to show the "View credential" link
    url: string;
    badgeImage: string;         // TODO fill with badge asset path
  }[];
  education: {
    school: Localized; degreeTitle: Localized; field: Localized;
    location: Localized; year: string;
    crestImage: string;         // TODO fill with university crest path
  };
}
```

`ui` keys in use: `experience, skills, certs, contact, downloadCV, getInTouch, available,
problem, approach, impact, keyAchievements, coreScope, present, education, graduated,
viewCred, badgeHint, contactSub`.

---

## 6. Sections / components to build

Rebuild top to bottom (each maps to a function of the same idea in `index.html`):

1. **TopBar / Nav** (`nav()`) — sticky. Traffic-light dots, `marcin@portfolio ~ ./whoami`
   prompt, anchor links, EN/PL segmented control, theme button. Mono font.
2. **Hero** (`hero()`) — two columns. Left: availability pill, role kicker, big name `<h1>`,
   summary, CV + "Get in touch" buttons, and a **`$ cat contact.txt`** block listing email
   (`mailto:`) and phone (`tel:`). Right: a large **photo frame** (window chrome + image slot).
3. **Metrics band** (`metrics()`) — full-width 4-up strip (7+ / 5 / 4 / C1) with vertical dividers.
4. **Skills** (`skills()`) — 2-col grid of 8 grouped cards, each a label + chip cloud.
5. **Certifications** (`certs()`) — 4 **glowing square badge tiles** side by side (drop targets),
   caption + issuer/year + optional Credly link. Below: the **education "diploma" card**
   (crest slot, bilingual school name, degree/field, location pill, big graduation year).
6. **Experience** (`experience()`) — the timeline. Left rail: node (amber if current), fake
   git hash, period. Right: a card per role with company/role, tech tags, context paragraph,
   the **Problem → Approach → Impact** highlight blocks (Mercedes & Volkswagen have them),
   and "core scope" bullets.
7. **Contact** (`contact()`) — `contact.sh` terminal panel: heading, sub, CV + email buttons,
   and a links row (GitHub / Credly). Footer line.

### Images
The prototype uses `<image-slot>` (client-side drag-drop, localStorage-persisted) so Marcin
can preview with his own files. For the real site, pick one:
- **Static import** the final photo/badges/crest into `/public` and render with `next/image`
  (simplest, best performance), **or**
- keep an upload affordance if he wants to swap images without a redeploy.
`badgeImage` / `crestImage` / a `profile.photo` field are already in the data model for this.

---

## 7. Behavior

- **i18n** — every visible string is `{en,pl}`. Language toggles the whole tree; persist choice
  and set `<html lang>`. Default `en` (targets an international recruiter audience).
- **Theme** — dark default, light alternate via a `data-theme` attribute (or `next-themes`
  `class`). Persist; avoid FOUC on load.
- **Smooth scroll** to anchor sections from the nav.
- **Links** — email is `mailto:`, phone is `tel:` (strip spaces in the href), CV is a real
  download, external links get `target="_blank" rel="noopener"`.

---

## 8. ⚠️ Real data to fill before launch (currently placeholders)

- **GitHub URL** — `profile.links.github` is `#`.
- **Exact Credly credential URLs** — all point to `credly.com`; use the real badge share links.
- **Profile photo** — hero slot is empty.
- **Certification badge images** — the 4 AWS/Credly PNGs (`certs[].badgeImage`).
- **University crest** — `education.crestImage`.
- Sanity-check dates/titles against the latest CV before shipping.

---

## 9. Accessibility & responsive

- Maintain contrast in **both** themes (the `--accentTx` split exists for this — don't
  collapse it back to pure amber on light).
- Segmented EN/PL uses `aria-pressed`; give the theme button an `aria-label`.
- Layout collapses to single column under ~900px (hero, timeline rail, edu card, grids).
  Keep tap targets ≥44px.
- Respect `prefers-reduced-motion`: the badge/edu glow pulse and the caret blink should be
  disabled under it (the prototype animates `glowPulse` / `blink` — gate them).

---

## 10. Paste-into-Claude-Code prompt

> I'm building a personal portfolio site. This folder is a design handoff: `index.html` is a
> complete working reference prototype (vanilla), `content.json` has all my content in EN/PL,
> `README.md` documents tokens, data model and components, and `public/` has my CV.
>
> Scaffold a **Next.js + TypeScript** app that reproduces `index.html` exactly — same layout,
> the design tokens in README §4, dark/light theme (dark default, persisted) and PL/EN i18n
> driven by `content.json`. Build the components listed in README §6, wire `mailto:`/`tel:`/CV
> download, and make it responsive per §9. Use `next/image` with static imports for the photo,
> the 4 certification badges and the university crest (leave clearly-marked placeholders where
> §8 says data is still missing). Start by reading `index.html` and `content.json`.
