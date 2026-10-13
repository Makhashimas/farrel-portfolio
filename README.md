# FARREL.OS — Personal Portfolio

My personal portfolio site: a retro, pixel-art **"operating system"** themed
single-page web app. It boots with a startup sequence, then presents my profile,
projects, skills, and achievements through a playful `FARREL.OS` interface.

**🔗 Live:** https://makhashimas.github.io/farrel-portfolio/

---

## ✨ Highlights

- 🕹️ **Boot sequence & "PRESS START"** entry screen
- 🎨 **Pixel-art theme system** — animated sprite fields, aurora / god-ray beams, CRT-style effects
- 🖥️ **Command console** — type commands to navigate (`RUN.EXE`), with tab-completion & history
- 🎵 **Now Playing widget** — a themed retro audio player
- 🧩 **Sections:** Profile · Projects (Quest Log) · Now Building · Skills (Inventory) · Achievements · Contact
- 📱 **Responsive**, with reduced-motion support
- 🔍 **SEO-ready** — meta tags, Open Graph, sitemap, robots, web manifest

---

## 🛠️ Tech stack

| Layer | Tech |
|---|---|
| Markup | Semantic **HTML5** |
| Styling | Hand-written **CSS** (custom properties, animations, grid/flex) |
| Behavior | **Vanilla JavaScript** (no framework, no build step) |
| Assets | Inline **SVG** pixel sprites & icons |
| Hosting | **GitHub Pages** |

No build step — the site is static and runs directly from the repository.

---

## 📁 Structure

```
farrel-portfolio/
├── index.html          # main page
├── hermes.html         # Hermes app page
├── privacy.html        # privacy policy
├── 404.html            # custom not-found page
├── style.css           # all styling
├── script.js           # all interactivity
├── favicon.svg
├── site.webmanifest
├── robots.txt
├── sitemap.xml
└── assets/
    ├── art/            # pixel-art SVG sprites
    ├── audio/          # player audio
    ├── fonts/          # webfonts
    ├── og-image.png    # social share card
    └── icon-*.png      # app icons
```

---

## 🚀 Run locally

Because it's fully static, just open `index.html` — or serve it:

```bash
# Python 3
python -m http.server 8000

# then visit http://localhost:8000
```

---

## 🚢 Deployment

Deployed with **GitHub Pages** from the repository root. Push to the default branch
and the site rebuilds automatically.

---

## 📄 License

© 2026 Farrel Fayzul Haqqi. All rights reserved.
The site content, personal branding, and artwork are my own; please don't reuse them
without permission.

---

<p align="center"><i>Built by <a href="https://github.com/Makhashimas">Farrel Fayzul Haqqi</a> · Electrical Engineering @ ITS Surabaya</i></p>
