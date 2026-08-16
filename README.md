# Fahim Imam — Portfolio

Welcome! This is the source code for my personal portfolio website,
**fahimimam.pro.bd** — a Hugo-built, statically generated site that
showcases the projects I've shipped, the posts I've written, and a
little about who I am.

**Live site:** [fahimimam.pro.bd](https://fahimimam.pro.bd)
&nbsp;|&nbsp; **Mirror:** [fahimimam.sytes.net](https://fahimimam.sytes.net)

---

## What's here

| Section   | What you'll find                                                          |
|-----------|---------------------------------------------------------------------------|
| `/`       | A landing page with a terminal-style hero and quick links to the rest.    |
| `/about/` | About me, with a `schema.org/Person` structured-data block.               |
| `/cv/`    | My CV, viewable inline as a PDF.                                           |
| `/now/`   | What I'm focused on right now (updated as things change).                  |
| `/uses/`  | The editor, terminal, and hardware I use to write code.                   |
| `/blog/`  | Posts on backend engineering, deployment, and lessons learned.             |
| `/projects/` | A list of projects, each with a full-page engineering case study.        |
| `/search/` | A Fuse.js-powered search across blog posts and projects.                 |

The two domains serve the exact same build — Nginx distinguishes them
by `Host` header on the VPS. Clicking around on either domain keeps
you on that domain.

---

## Features visitors tend to notice

- **Eight hand-built colour palettes** — cyberpunk, synthwave,
  solarized, terminal, nord, monokai, dracula, and catppuccin.
  Switch from the floating ⚙ panel or by pressing <kbd>T</kbd>.
- **A matrix-rain canvas** behind the content. Toggle on/off with
  <kbd>R</kbd>, change speed with <kbd>[</kbd> / <kbd>]</kbd>,
  opacity with <kbd>−</kbd> / <kbd>=</kbd>. Settings persist in
  `localStorage` and survive cross-tab reloads.
- **A keyboard-first dashboard** for theme + rain controls, with
  one binding per setting.
- **Person JSON-LD** on `/about/` for a richer search-result card.
- **Multi-domain navigation** that doesn't lock you to whichever
  domain you arrived on.
- **Site search** scoped to `/blog/` and `/projects/` only — no
  noise from taxonomy landing pages.
- **Reduced-motion support** — every animation respects the OS-level
  `prefers-reduced-motion` preference.

---

## Built with

- **[Hugo](https://gohugo.io/)** ≥ 0.155 (extended) — static site
  generation, ~60 ms build for 56 pages, fully static output.
- **[PaperMod](https://github.com/adityatelange/hugo-PaperMod)** —
  the upstream theme. *Not edited in place*; layout overrides live
  in `layouts/`.
- **Vanilla CSS + ES5 JS** — no bundler, no framework, no build
  pipeline. Every script ships as-is and is `defer`'d except a
  single inline FOUC-boot script in the document `<head>`.
- **Rsync + Nginx** — `./deploy.sh` pushes `./public/` to a VPS.

No server-side rendering, no API routes, no JavaScript framework. The
whole site is plain HTML, CSS, and JS.

---

## Repository layout

```
.
├── archetypes/                # `hugo new` templates (blog post scaffold)
├── assets/css/extended/       # Bundled CSS — 6 theme palettes + non-landing styles
├── content/                   # Markdown source for every page
│   ├── about.md, cv.md, now.md, uses.md
│   ├── blog/                  # Blog posts
│   └── projects/              # Project case studies
├── data/                      # Hugo data files (terminal lines, home card copy)
├── layouts/                   # Theme overrides — the interesting bits
│   ├── index.html             # The landing page (custom HTML + CSS)
│   ├── _default/              # baseof + list + two project showcase templates
│   ├── about/, cv/, now/, uses/   # Per-section layouts
│   └── partials/              # Overrides for header, footer, breadcrumbs, etc.
├── static/
│   ├── cv/                    # Embedded CV PDF
│   ├── favicon.svg            # Site favicon
│   ├── images/                # Profile photo etc.
│   └── js/
│       ├── matrix.js          # Canvas rain, theme-aware glyph colour
│       └── theme-dashboard.js # Floating theme + rain panel
├── themes/PaperMod/           # Upstream theme — DO NOT edit
├── hugo.toml                  # Site config
└── deploy.sh                  # one-command deploy
```

---

## Local preview

Prereqs: **Hugo ≥ 0.155 (extended)** and **Node** only if you want to
run the smoke tests.

```bash
hugo server
# → http://localhost:1313
```

`hugo server` regenerates on save, so editing CSS in
`assets/css/extended/custom.css` is instant — no bundler step.

## Production build

```bash
hugo --minify
# Output → ./public/ — ~600 KB of HTML/CSS/JS, ~60 ms build
```

The build is fully static. Drop `./public/` behind any web server.

---

## Deploy

```bash
./deploy.sh
```

The script:

1. Runs `hugo --minify`
2. Prints `public/` size + file count
3. Asks for confirmation
4. `rsync -avz --delete public/ fahimimam@<vps>:/var/www/portfolio/`
5. Reloads Nginx on the VPS

**Rollback:** keep the last good `public/` on disk; rerun `deploy.sh`
after `rsync`-ing it back, or `git checkout` the last working commit
and rebuild. No CI to bypass.

---

## Engineering case studies

Two projects ship with full-page engineering case studies built from
custom Hugo templates — twelve sections each, with embedded Go code
samples:

- **[Lunch Tracker](https://fahimimam.pro.bd/projects/lunch-tracker/)**
  — a Go + Postgres service, including the embedded code samples and
  the reasoning behind the schema and API shape.
- **[This portfolio itself](https://fahimimam.pro.bd/projects/portfolio/)**
  — the meta case study: theme system, FOUC boot, multi-domain
  navigation, deploy pipeline, and the moving parts that aren't
  obvious from a directory listing.

---

## For developers

If you're interested in the codebase itself — theme authoring, the
FOUC boot script, multi-domain navigation, the embedded code
samples, or the matrix rain internals — see
[`README.dev.md`](./README.dev.md).

That file documents the moving parts that aren't obvious from a
directory listing: the build / deploy / theme-author loop, the 17
CSS tokens that make up a theme, the partial overrides that fix
Hugo's host-locking, and the conventions for adding a new project.

---

## Licence

The site's source code is open for reading. If you'd like to reuse
parts of it for your own portfolio, please credit the original and
link back here.

---

## Contact

- **GitHub:** [@fahimimam](https://github.com/fahimimam)
- **LinkedIn:** [Kazi Fahim Imam](https://www.linkedin.com/in/kazi-fahim-imam-0027081a1/)
- **Email:** fahimimam026@gmail.com