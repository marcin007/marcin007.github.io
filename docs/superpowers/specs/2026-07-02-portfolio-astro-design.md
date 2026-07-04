# Portfolio Marcina Wojciechowskiego — Astro + TypeScript — Spec

- **Data:** 2026-07-02
- **Status:** zatwierdzanie designu
- **Repo:** `marcin007.github.io` (GitHub **user-site** — serwowane z roota `https://marcin007.github.io/`)
- **Źródło designu:** `handoff/` (prototyp `index.html`, `content.json`, `README.md`, CV PDF) wygenerowany w Claude Design

## 1. Cel

Wierny, produkcyjny port prototypu `handoff/index.html` na **Astro + TypeScript**, wdrażalny na **GitHub Pages**, z czystą strukturą pod przyszłe animacje („wodotryski"). Motyw wizualny: **terminal / deploy-log** (monospace, pasek jak wiersz poleceń, timeline doświadczenia jak historia git). v1 ma odwzorować prototyp **1:1** — layout, tokeny, zachowanie — i realnie się deployować.

## 2. Kluczowe decyzje

| Temat | Decyzja | Uzasadnienie |
|---|---|---|
| Framework | **Astro**, `output: 'static'` | Statyczny one-pager; zero runtime frameworka domyślnie, najczystszy deploy na Pages |
| Język | **TypeScript** | `content.json` otypowany interfejsem `Content` |
| Komponenty | **czyste `.astro`** w v1 (bez React) | Zero client-JS poza drobnymi skryptami theme/anim; `@astrojs/react` dokładany później jedną komendą, gdy animacje w React |
| i18n | **dwie trasy**: `/` (EN) + `/pl/` (PL), obie z **jednego** `content.json` | Rendering na buildzie, bez klienckiej logiki podmiany tekstu; TS wychwyci brakujące tłumaczenia; treść edytowana w jednym dwujęzycznym pliku |
| Domyślny język | **EN** | Odbiorca: rekruter międzynarodowy (za README) |
| Motyw | dark default, `localStorage`, **inline no-flash script** w `<head>` | Brak mignięcia (FOUC) przy starcie |
| Fonty | **self-host** `@fontsource/ibm-plex-sans` + `@fontsource/ibm-plex-mono` | Szybciej, prywatniej, offline, bez layout-shiftu vs Google Fonts `<link>` |
| Obrazy | `Placeholder.astro` w miejscach foto / 4 badge / crest; `astro:assets <Image>` po podmianie | `<image-slot>` z prototypu był tylko narzędziem podglądu (README: „reference only") |
| Deploy | oficjalny **`withastro/action`** → GitHub Pages przy push do `master` | Standard dla Astro; `site` w `astro.config`, `.nojekyll` w `public/`, root → bez `base` |

## 3. Struktura plików

```
/ (root repo)
├─ astro.config.mjs          # site: 'https://marcin007.github.io', integracje
├─ package.json · tsconfig.json
├─ public/
│  ├─ Marcin-Wojciechowski-CV.pdf   # 1:1 z handoffu
│  └─ .nojekyll
├─ src/
│  ├─ data/content.json      # 1:1 z handoffu (EN/PL, single source of truth)
│  ├─ types.ts               # interfejs Content (README §5)
│  ├─ i18n.ts                # L({en,pl}, lang) / t(key, lang), typ Lang
│  ├─ styles/global.css      # tokeny + bazowe style — 1:1 z prototypu
│  ├─ layouts/
│  │  └─ Base.astro          # <head> (meta, fonty, tokeny, no-flash theme-script), <body>, <slot>
│  ├─ pages/
│  │  ├─ index.astro         # EN — składa sekcje z lang="en"
│  │  └─ pl/index.astro      # PL — te same sekcje z lang="pl"
│  └─ components/
│     ├─ Nav.astro
│     ├─ Hero.astro
│     ├─ Metrics.astro
│     ├─ Skills.astro
│     ├─ Certifications.astro
│     ├─ Education.astro
│     ├─ Experience.astro
│     ├─ JobCard.astro
│     ├─ Contact.astro
│     └─ Placeholder.astro
└─ .github/workflows/deploy.yml
```

## 4. Komponenty (mapowanie z README §6 / funkcji prototypu)

- **Base.astro** — layout: `<head>` z meta/OG, self-hostowane fonty, `global.css`, inline no-flash theme-script; przyjmuje `lang`; ustawia `<html lang>`.
- **Nav.astro** (`nav()`) — sticky, mono. Traffic-light kropki, prompt `marcin@portfolio ~ ./whoami`, linki-kotwice, segment EN/PL (linki do `/` i `/pl/`, `aria-pressed` = aktywna trasa), przycisk motywu (`aria-label`).
- **Hero.astro** (`hero()`) — 2 kolumny. Lewa: pill „open to opportunities", kicker roli, `<h1>` z nazwiskiem, lede, przyciski CV + „Get in touch", blok `$ cat contact.txt` (email `mailto:`, telefon `tel:` bez spacji). Prawa: „photo-frame" z chrome okna + `Placeholder` na zdjęcie.
- **Metrics.astro** (`metrics()`) — pasek 4-up (7+ / 5 / 4 / C1) z pionowymi dzielnikami.
- **Skills.astro** (`skills()`) — grid 2-kol, 8 kart (label + chmura chipów).
- **Certifications.astro** (`certs()`) — 4 świecące kwadratowe kafle-badge (`Placeholder`), podpis + issuer/rok + opcjonalny link Credly. Renderuje pod spodem `Education`.
- **Education.astro** — karta „dyplom": crest (`Placeholder`), dwujęzyczna nazwa uczelni, stopień/kierunek, pill lokalizacji, duży rok ukończenia.
- **Experience.astro** (`experience()`) — timeline; nagłówek `$ git log --oneline --all`; mapuje `jobs` na `JobCard`.
- **JobCard.astro** — szyna (węzeł amber gdy `current`, fake git hash, okres) + karta: firma/rola, tagi tech, kontekst, bloki **Problem → Approach → Impact** (gdy `highlights`), bullety „core scope".
- **Contact.astro** (`contact()`) — panel `contact.sh`: nagłówek z migającym kursorem, sub, przyciski CV + email, wiersz linków (GitHub / Credly), stopka.
- **Placeholder.astro** — elegancki placeholder (kształt: `rect|rounded|circle`) w miejscu brakującego obrazu; wyraźnie oznaczony punkt podmiany na `<Image>`.

## 5. Dane i i18n

- `content.json` wchodzi **1:1** z handoffu; `types.ts` definiuje interfejs `Content` (za README §5) — plik importowany i otypowany.
- `i18n.ts`: `type Lang = 'en' | 'pl'`; `L(value, lang)` zwraca lokalizowany string dla `{en,pl}` (passthrough dla zwykłych wartości); `t(key, lang)` = `L(content.ui[key], lang)`. Obie strony (`index.astro`, `pl/index.astro`) przekazują `lang` w dół do komponentów.

## 6. Zachowanie

- Smooth-scroll do sekcji z nav (`scroll-behavior:smooth`, `scroll-margin-top`).
- Email `mailto:`, telefon `tel:` (usunięte spacje w href), CV realny `download`.
- Linki zewnętrzne: `target="_blank" rel="noopener"`.
- Motyw: toggle flipuje `data-theme` + zapis w `localStorage`; inline-script czyta i ustawia przed paintem.
- Język: przełącznik to link do drugiej trasy; wybór motywu przenosi się przez `localStorage`.

## 7. Dostępność i responsywność

- Kontrast utrzymany w **obu** motywach — zachowany split `--accent` (fille) / `--accentTx` (tekst, ciemniejszy w light).
- `aria-pressed` na segmencie EN/PL (aktywna trasa), `aria-label` na przycisku motywu, tap-targety ≥44px.
- Layout → single-column poniżej ~900px (hero, timeline, karta edu, gridy) — jak w prototypie.
- `prefers-reduced-motion`: wyłącza puls glow (badge/edu) i miganie kursora.

## 8. Grunt pod animacje (cel na przyszłość)

- Struktura gotowa na skrypty/wyspy; `prefers-reduced-motion` już obsłużone; zachowane istniejące subtelne efekty (glow badge, migający kursor).
- Kandydaci na kolejny krok (poza zakresem v1): scroll-reveal timeline „git log", count-up metryk, efekt pisania w prompcie, smooth-scroll (Lenis), View Transitions między trasami.

## 9. Do uzupełnienia przed launchem (oznaczone w kodzie)

- Realny URL **GitHub** (w danych `#`).
- Realne linki **Credly** do konkretnych badge'y (teraz generyczne).
- **Zdjęcie** profilowe, **4 badge** certyfikatów, **crest** uczelni.
- Sanity-check dat/tytułów względem aktualnego CV.

## 10. Poza zakresem v1

- Bogate animacje (osobny, kolejny krok).
- Realne assety graficzne (na razie placeholdery).
- CMS / backend / formularz kontaktowy / analytics.

## 11. Kryteria akceptacji

1. Wygląd i zachowanie **1:1 z prototypem** w obu motywach i obu językach.
2. `astro build` przechodzi bez błędów; `content.json` w pełni otypowany.
3. Trasy `/` i `/pl/` renderują poprawny język; motyw i wybór języka trwałe.
4. Workflow deploy zielony; strona żyje pod `https://marcin007.github.io/`.
5. `prefers-reduced-motion` respektowane; brak regresji dostępności (kontrast, aria, tap-targety).
