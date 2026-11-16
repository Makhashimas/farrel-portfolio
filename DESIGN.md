---
name: FARREL.OS
description: Retro pixel-art desktop OS portfolio for Farrel Fayzul Haqqi, a first-year Electrical Engineering student at ITS Surabaya. One scrollable boot log of seven screens: hero cassette deck, about, quest log, now building, inventory, achievements, contact.
colors:
  night-deep: "#0a0e27"
  night: "#131a3a"
  navy: "#1e2a5a"
  navy-lite: "#2d3d7a"
  ink: "#0b0f24"
  paper: "#e8ecf7"
  paper-dim: "#a8b3d4"
  signal-cyan: "#3de8c4"
  signal-cyan-dim: "#1f8f78"
  arcade-gold: "#ffd34d"
  arcade-gold-dim: "#b8912a"
  alert-rose: "#ff5c8a"
  alert-rose-dim: "#b83a5e"
  horizon-teal: "#4fc3e8"
  sky-a: "#0a0e27"
  sky-b: "#131a3a"
  moon-face: "#ffd34d"
  moon-shade: "#b8912a"
typography:
  display:
    fontFamily: "'Press Start 2P', 'Courier New', monospace"
    fontSize: "clamp(28px, 5.4vw, 58px)"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: ".02em"
  heading:
    fontFamily: "'Press Start 2P', 'Courier New', monospace"
    fontSize: "clamp(20px, 3.4vw, 32px)"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: ".02em"
  title:
    fontFamily: "'Press Start 2P', 'Courier New', monospace"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: ".04em"
  label:
    fontFamily: "'Press Start 2P', 'Courier New', monospace"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: ".04em"
  micro:
    fontFamily: "'Press Start 2P', 'Courier New', monospace"
    fontSize: "9px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: ".02em"
  body:
    fontFamily: "'VT323', 'Courier New', monospace"
    fontSize: "22px"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: ".01em"
rounded:
  none: "0px"
  round: "50%"
spacing:
  "2xs": "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "22px"
  xl: "26px"
  "2xl": "36px"
components:
  button-primary:
    background: "{colors.arcade-gold}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    border: "4px solid {colors.ink}"
    padding: "16px 22px"
    boxShadow: "4px 4px 0 {colors.ink}"
  button-ghost:
    background: "transparent"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    border: "4px solid {colors.paper}"
    padding: "16px 22px"
    boxShadow: "4px 4px 0 {colors.alert-rose-dim}"
  nav-link:
    background: "transparent"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    border: "3px solid transparent"
    padding: "10px 12px"
  chip:
    background: "{colors.ink}"
    textColor: "{colors.signal-cyan}"
    typography: "{typography.label}"
    border: "2px solid {colors.signal-cyan-dim}"
    padding: "8px 10px"
  quest-card:
    background: "{colors.night}"
    textColor: "{colors.paper-dim}"
    border: "4px solid {colors.ink}"
    padding: "26px"
    boxShadow: "6px 6px 0 rgba(11, 15, 36, .55)"
  status-banner:
    background: "rgba(255, 211, 77, .08)"
    textColor: "{colors.arcade-gold}"
    typography: "{typography.label}"
    border: "3px solid {colors.arcade-gold-dim}"
    padding: "12px 16px"
---

# FARREL.OS Design System

This file is the rulebook for every change to `makhashimas.github.io/farrel-portfolio`. It describes the system that already exists in `style.css`, `script.js` and the `assets/` folder. It is descriptive, not aspirational: if a rule here conflicts with the ground rules of the brief (retro pixel-art, no Google or Gemini mentions, no autoplay audio, no invented content), the brief wins.

## Overview

FARREL.OS is a fake-but-honest operating system boot log. The visitor lands on a boot screen, then reads one page of seven screens, each introduced by a terminal-style section header: `01 / PROFILE ABOUT`, `02 / PROJECTS WORK`, `03 / NOW NOW`, `04 / SKILLS SKILLS`, `05 / AWARDS WINS`, `06 / CONTACT MAIL`. The hero is a night sky above a city of pylons with a cassette deck floating in it.

The mood is **hand-made 16-bit machine, not a web template**. Every surface is a hard-edged rectangle with a heavy ink border and a hard offset shadow. Nothing is blurred, nothing is frosted, nothing is a soft rounded card. Depth comes from offset shadows and layering, never from gradients or blur.

Three themes ship: `night` (default, navy and cyan), `sunset` (warm orange, triggered by the moon in the top right) and `gnr` (Guns N' Roses gold and red, only reachable by playing *Sweet Child O' Mine* from the cassette deck). All three themes re-point the same variable names, so no component ever hardcodes a theme colour.

### Key Characteristics

- Hard 0px corners everywhere. Circular only for the moon, LEDs and reels.
- 3px to 5px ink borders, 4px to 6px hard offset shadows. Pressing a control moves it into its own shadow.
- Stepped motion: `steps(2)` for feedback, `steps(6)` to `steps(8)` for reveals. Linear animation for the starfield and the horizon only.
- Two typefaces, self-hosted: Press Start 2P for anything the OS says, VT323 for human prose.
- No stock imagery, no icon webfont, no external requests. Pixel SVG art and photos live in `assets/`.

## Colors

The palette is a saturated arcade palette living on a very dark navy. Contrast comes from value separating a dark ground from a bright accent, plus the 3px ink outline that fences every element.

| Token | Value | Role |
|---|---|---|
| `--night` | `#0a0e27` | Page ground, deepest layer. Sky top in night theme. |
| `--night-2` | `#131a3a` | Panel surface (quest cards, terminal windows). Sky bottom. |
| `--navy` / `--navy-lite` | `#1e2a5a` / `#2d3d7a` | Card art gradients, inactive chrome, window titlebars. |
| `--ink` | `#0b0f24` | Every border, every offset shadow, and text on bright fills. |
| `--paper` | `#e8ecf7` | Body copy and headings on dark ground. |
| `--paper-dim` | `#a8b3d4` | Secondary prose, meta lines, captions. |
| `--cyan` / `--cyan-dim` | `#3de8c4` / `#1f8f78` | Primary accent, links, hover fill, chips, progress. |
| `--gold` / `--gold-dim` | `#ffd34d` / `#b8912a` | Identity and call to action. The surname, the primary button, the focus ring. |
| `--rose` / `--rose-dim` | `#ff5c8a` / `#b83a5e` | Secondary button, alerts, the cassette LED. |
| `--teal` | `#4fc3e8` | Info accent, horizon highlights. |

Rules:

- **Gold is the identity, cyan is the interaction.** Gold marks who Farrel is (surname, CTA, status dot). Cyan marks what you can do and what just happened.
- Never put gold text on cyan, or cyan text on gold. Both are bright; they need ink between them.
- Never introduce a colour outside this table. Theme progression shifts the existing hues; it does not add new ones.
- Bright fills (`--gold`, `--cyan`, `--rose`) always carry `--ink` text and an ink border.

## Typography

Two families, both self-hosted woff2 with `font-display: swap`:

- **Press Start 2P** (`--f-pixel`) is the machine voice: nav links, buttons, section headers, labels, chips, stat numbers, terminal output. It is very wide, so it stays at 9px to 14px and gains weight from letter-spacing (`.02em` to `.06em`) rather than size. Never use it for a paragraph.
- **VT323** (`--f-term`) is the human voice: prose, descriptions, the log lines. It renders large (19px to 24px) because it is thin.

Rules:

- One idea per type size. There are five step sizes for the pixel font (`micro` 9, `label` 11, `title` 14, `heading` 20-32, `display` 28-58) and one for prose.
- Prose is never centred except in the terminal windows, where the LCD metaphor requires it.
- Uppercase is the default for the pixel font. Lowercase appears only inside prose.
- No text may sit below 11px for interactive labels; the machine voice must remain legible at arm's length.

## Layout

- One page, six sections plus the hero, in the order above. Never reorder, never add a section.
- Sticky top chrome (`.bar`) with the logo, the nav and the RUN button. Section anchors offset below it.
- The hero uses a two column split: prose column left, cassette deck stage right. On narrow screens the stage drops below the prose.
- `--r: 0px`: there is no radius scale. Do not add one.
- Content is capped around 76ch for prose; quest cards run two per row, collapsing to one at 900px and below.
- Breakpoints in use: 1340, 1150, 980, 900, 780, 640, 520, 380.

## Elevation & Depth

Depth is purely graphical, never optical:

- `--shadow-hard`: `4px 4px 0 var(--ink)`. Controls at rest.
- `--shadow-soft`: `6px 6px 0 rgba(11, 15, 36, .55)`. Panels and cards.
- Deep hover: `9px 9px 0 rgba(11, 15, 36, .65)`. The card lifts three pixels and grows its shadow.
- Pressed: the element translates by the shadow offset and the shadow becomes `none` or `1px 1px 0`. A button that does not move into its shadow is not finished.
- No blur, no backdrop-filter, no soft alpha glow except the moon's `--moon-glow`, which is decoration, not elevation.
- Layer order, back to front: horizon canvas (0), starfield (0/1), ASCII fluid layer (1), hero art (2), content (2-4), top chrome (90-130), boot screen (250).

## Shapes

- Rectangles, hard corners, 3px to 5px ink outlines.
- Decorative circles: moon, LEDs, reels, sprocket holes. Nothing else is round.
- Pixel art is authored at integer sizes and scaled by integer factors so the grid stays crisp. Never scale pixel art by a fractional factor, never rotate it off-axis.
- Photos are never free-floating: they are cropped to 16:9 and filtered into the palette (`saturate(.86) contrast(1.06) brightness(.94)`) behind a scanline and tint overlay.

## Motion

Motion is the third voice of the OS: it is stepped, not eased, wherever a machine is speaking.

- **Feedback** (hover, press, LED, blink): 100ms to 180ms with `steps(2)`.
- **State change** (theme swap, LED groups, panel open): 400ms to 500ms with `steps(6)` to `steps(8)`.
- **Reveals**: 600ms `steps(8)`, staggered 30ms to 60ms, entering from `translateY(28px)` plus opacity. Nothing starts at `scale(0)`; start at 0.95.
- **Ambient** (starfield, horizon drift, ASCII fluid): linear or `steps(12)` at very low opacity, drawn on canvas, never on dozens of DOM nodes.
- **Scroll-linked** effects are driven by scroll progress (`animation-timeline: scroll()` / `view()` where supported, `requestAnimationFrame` fallback), not by timers.
- **Audio is opt-in only.** Nothing on the page plays sound until the visitor presses play on the cassette deck. The `gnr` theme cannot be reached without that press.
- `prefers-reduced-motion: reduce` removes parallax, counting, typing and stepping; only instant state or a simple fade remains.
- There is no scroll hijacking. Smoothing is light, and every pinned moment releases inside one viewport.

## Components

- **Primary button** (`.btn--primary`): gold fill, ink text, 4px ink border, hard shadow. Hover turns it cyan. Press translates it 4px into its shadow.
- **Ghost button** (`.btn--ghost`): transparent with paper border and rose-dim shadow. Hover fills rose with ink text. Used for the secondary action.
- **Nav link** (`.bar__link`): pixel font, paper text, transparent 3px border. Hover fills gold with ink text and lifts one pixel. The active section is marked the same way the hover is.
- **Quest card** (`.quest`): night-2 surface, 4px ink border, soft shadow, two per row. Hover lifts it 3px, reddens the border to cyan-dim and reveals a cyan spotlight that follows the pointer. The whole card opens the detail page.
- **Tag / chip**: cyan tag on the card art, ink chips with cyan text for tech stacks.
- **Status banner** (`.hero__status`): a quiet gold outline box with a 8% gold wash and a blinking dot. It announces the Anargya application without competing with the CTA.
- **Cassette deck** (`.cart`): the one playful object. LCD screen with marquee, tape reels that spin only while playing, LED that pulses, progress bar and time readout that appear only when audio is loaded.
- **Terminal window**: window chrome with titlebar, monospace lines, optional blinking cursor. Used for the about profile and the build log.

## Do's and Don'ts

**Do**

- Do keep every new element inside the ink-border-plus-offset-shadow grammar.
- Do reuse the existing variables. If a new value is needed, add a variable, not a literal.
- Do raise contrast and size for legibility without swapping fonts or hues.
- Do animate `transform` and `opacity` only, with stepped timing where a machine is speaking.
- Do check `prefers-reduced-motion`, keyboard focus and 380px width before shipping a change.

**Don't**

- Don't soften the look: no border-radius, no blur, no frosted glass, no soft drop shadows, no gradient blobs.
- Don't migrate frameworks or add a UI library. Vanilla HTML/CSS/JS, with any library vendored locally into `assets/js/`.
- Don't load anything from a third-party origin: no CDN, no Google Fonts, no analytics, no embedded map, no remote image.
- Don't mention Google or Gemini anywhere on the site. The only exceptions are `hermes.html` and `privacy.html`, which exist for OAuth verification and stay `noindex`.
- Don't autoplay audio, and don't expose the `gnr` theme without a deliberate play press.
- Don't rewrite copy, remove sections, add filler sections, testimonials or stock photos, and never invent data, numbers or photos.
- Don't animate keyboard-driven or high-frequency actions, and don't fight native scrolling.
