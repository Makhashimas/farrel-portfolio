---
name: FARREL.OS
owner: Farrel Fayzul Haqqi — Electrical Engineering, Institut Teknologi Sepuluh Nopember (ITS) Surabaya, first year (NRP 5022261059)
live: https://makhashimas.github.io/farrel-portfolio/
repo: https://github.com/Makhashimas/farrel-portfolio
stack: vanilla HTML / CSS / JS (no framework). Lenis + a small motion layer, all vendored locally.
---

# What this is

A single-page personal portfolio that behaves like a retro operating system
(**FARREL.OS**): a boot screen, a pixel-art night-city hero with a cassette deck
that plays Guns N' Roses, terminal-style section headers, and window chrome.
It exists to support one concrete goal: Farrel's application to the **Tim Riset
Anargya** (Formula Student EV, ITS — Low Voltage / safety division), and later to
Google Student Ambassador Batch 2 and scholarships.

The "website pribadi/blog" column on that application lands here, so the page has
to read as **hand-made and deliberate**, not as a generated template.

# Audience and job

- **Primary:** Anargya research-team reviewers (engineering-minded, skimming).
  They must see, within the hero and one scroll: who he is, what he builds, proof
  (boards, PCB, firmware), and how to reach him.
- **Secondary:** recruiters, scholarship reviewers, fellow student engineers.

# What must stay true (source of truth)

Refining, not redesigning. Non-negotiable and unchanged by any later step:

1. The FARREL.OS retro-OS concept, the pixel-art style and every existing pixel asset.
2. The palette (navy / cyan / yellow / magenta) — see DESIGN.md for exact tokens.
3. The pixel display font (Press Start 2P) and the terminal/CRT voice.
4. The night sky + city + pylons hero, the cassette player, the terminal-style
   section headers.
5. Section order and page flow: `top → about → projects → now → skills → awards → contact`.
6. Every line of existing copy, every section, every project entry. No invented
   data, photos or numbers. No filler, testimonials, gradient blobs, stock imagery.

# Page map

| File | Role |
| --- | --- |
| `index.html` | The single-page portfolio (7 sections, sticky nav, boot screen, RUN palette, cassette deck) |
| `project.html?p=<slug>` | One template rendering a project from `projects-data.js` (7 entries) |
| `hermes.html`, `privacy.html` | Companion pages (tooling note, OAuth privacy policy) |
| `404.html` | Retro-styled not-found page |
| `style.css` | ~3,100 lines, the whole design system |
| `script.js` | ~1,700 lines: boot, nav, palette, cassette/audio, reveals |
| `motion.js`, `horizon.js` | Vendored motion + sky layers |
| `DESIGN.md` | The rulebook: tokens, type scale, pixel scale, motion rules |

Interaction grammar (keep): boot screen → sticky command bar → RUN palette on
`Ctrl+K` (`/` too) → scroll through sections → project windows open project pages.

# Content Farrel still has to supply (never fabricate)

- A portrait / photo of himself for the About window.
- Photos of the physical boards: MP3 player (ESP32-S3), buck converter (LM2575),
  laptop cooling pad.
- Scope captures / measurement screenshots for the electrical projects.
- Confirm whether the Anargya status line may name the division publicly.

# Success criteria for this refinement pass

See `docs/audit-baseline.md`. In short: same design, measurably better craft —
no clipped text, no overlaps, WCAG AA contrast, visible focus, 60fps scroll,
scroll-driven night-city motion that stays inside the existing palette, and a
`detect` report with no P0/P1 findings left.
