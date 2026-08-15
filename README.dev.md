# Portfolio — Developer Notes

This file is for **anyone working on the codebase**, not for visitors.
It documents the build / deploy / theme-author loop and the moving
parts that aren't obvious from a directory listing.

For the project's own engineering case study (problem statement,
architecture diagram, lessons learned), see
[`/projects/portfolio/`](https://fahimimam.pro.bd/projects/portfolio/)
on the live site.

---

## TL;DR

```bash
# Prereqs: Hugo ≥ 0.155 (extended) and Node only for ad-hoc smoke tests.
hugo server                       # live preview at http://localhost:1313
hugo --minify                     # build → ./public/
./deploy.sh                       # rsync ./public/ to the VPS
```

---

## Repository layout

```
.
├── archetypes/                    # `hugo new` templates
├── assets/
│   └── css/
│       └── extended/
│           └── custom.css         # 6 theme palettes + non-landing styles
├── content/
│   ├── _index.md                  # (unused — landing page is layouts/index.html)
│   ├── about.md                   # /about page + Person JSON-LD
│   ├── cv.md                      # /cv page (embeds the PDF)
│   ├── now.md                     # /now — what I'm focused on
│   ├── uses.md                    # /uses — editor / hardware / stack
│   ├── blog/                      # PaperMod blog posts (Markdown)
│   └── projects/                  # each project gets its own .md + showcase
├── data/                          # Hugo data files (e.g. projects.json)
├── deploy.sh                      # one-command deploy
├── hugo.toml                      # site config
├── i18n/                          # i18n bundles
├── layouts/
│   ├── _default/
│   │   ├── baseof.html            # PaperMod base template
│   │   ├── list.html              # tag / category / section lists
│   │   ├── portfolio-showcase.html # the 12-section engineering case study + code samples
│   │   └── lunch-tracker-showcase.html  # the 12-section case study + Go code samples
│   ├── index.html                 # the landing page (custom HTML + CSS)
│   ├── about/single.html          # /about (custom layout + Person JSON-LD)
│   ├── cv/single.html             # /cv
│   ├── now/single.html            # /now
│   ├── uses/single.html           # /uses
│   └── partials/
│       ├── breadcrumbs.html       # OVERRIDE — host-relative
│       ├── extend_head.html       # FOUC boot + script tags
│       ├── footer.html            # OVERRIDE — host-relative copyright link
│       ├── head.html              # OVERRIDE — host-relative favicon
│       ├── header.html            # OVERRIDE — host-relative logo + menu
│       ├── post_card.html         # post-entry partial used by /blog/
│       ├── post_meta.html         # OVERRIDE — adds series badge
│       └── project-card.html      # card partial used in projects list
│       ├── breadcrumbs.html       # OVERRIDE — host-relative
│       ├── extend_head.html       # FOUC boot + script tags
│       ├── footer.html            # OVERRIDE — host-relative copyright link
│       ├── head.html              # OVERRIDE — host-relative favicon
│       ├── header.html            # OVERRIDE — host-relative logo + menu
│       └── project-card.html      # card partial used in projects list
├── static/
│   ├── cv/fahim-imam-cv.pdf       # embedded by /cv
│   ├── favicon.svg                # site favicon
│   ├── images/                    # profile photo etc.
│   └── js/
│       ├── matrix.js              # canvas rain, theme-aware glyph
│       └── theme-dashboard.js     # floating theme + rain panel
└── themes/
    └── PaperMod/                  # upstream theme — DO NOT edit
```

---

## Build, run, deploy

### Local preview

```bash
hugo server --buildDrafts
# → http://localhost:1313
```

`hugo server` regenerates on save, so editing CSS in
`assets/css/extended/custom.css` is instant. No bundler step.

### Production build

```bash
hugo --minify
# 56 pages, ~600 KB of HTML/CSS/JS, builds in ~60 ms.
```

Output goes to `./public/`. The build is fully static — no
server-side rendering, no API routes.

### Deploy

```bash
./deploy.sh
```

The script:

1. Runs `hugo --minify`
2. Prints `public/` size + file count
3. Asks for confirmation
4. `rsync -avz --delete public/ fahimimam@<vps>:/var/www/portfolio/`
5. Reloads Nginx on the VPS

Rollback: keep the last good `public/` on disk; rerun `deploy.sh`
after `rsync`-ing it back, or just `git checkout` the last working
commit and rebuild. No CI to bypass.

---

## How themes work

A theme is a complete override of the 17 CSS variables. They live
in [`assets/css/extended/custom.css`](./assets/css/extended/custom.css)
as `:root[data-theme="X"] { … }` blocks.

| Variable group | Tokens |
|---|---|
| Brand | `--neon-blue`, `--neon-orange`, `--neon-purple`, `--neon-green` |
| Surface | `--cyber-bg`, `--cyber-bg-2`, `--cyber-bg-3`, `--cyber-surface`, `--cyber-border`, `--cyber-glow`, `--cyber-glow-strong` |
| Text | `--text-primary`, `--text-secondary` |
| PaperMod passthrough | `--theme`, `--entry`, `--primary`, `--secondary`, `--tertiary`, `--content`, `--code-block-bg`, `--code-bg`, `--border` |

Themed blocks use `:root[data-theme="X"]`, which has higher CSS
specificity than the bare `:root` fallback at the bottom. The
fallback only applies when no `data-theme` attribute is set at all
— i.e. during the brief window before the FOUC boot script runs.

### Adding a 7th theme

1. Open `assets/css/extended/custom.css` and append a new
   `:root[data-theme="my-theme"] { … }` block defining all 17 tokens.
2. Open `static/js/theme-dashboard.js`, find the `THEMES` object,
   and add an entry:
   ```js
   my_theme: {
     label: 'My theme',
     desc:  'One-line description.',
     swatch: ['#hex1', '#hex2', '#hex3']
   }
   ```
   The key must match the CSS selector. The three swatch colours
   are shown on the dashboard card.
3. Rebuild. The dashboard picker auto-includes the new theme;
   no HTML changes needed.

### Switching themes at runtime

```js
document.documentElement.setAttribute('data-theme', 'monokai');
localStorage.setItem('lt.theme', 'monokai');
```

That's the whole mechanism. Both `matrix.js` and `theme-dashboard.js`
listen for the `lt:settings-change` event the dashboard fires after
a theme switch, and re-read their state.

---

## Theme + rain dashboard

`static/js/theme-dashboard.js` builds the floating ⚙ panel at boot,
injects its CSS once, and exposes keyboard shortcuts:

| Key | Action |
|---|---|
| <kbd>T</kbd> | Toggle the dashboard open / closed |
| <kbd>Esc</kbd> | Close the dashboard |
| <kbd>←</kbd> / <kbd>→</kbd> | Cycle themes (when panel open) |
| <kbd>[</kbd> / <kbd>]</kbd> | Rain speed − / + 0.1 (clamped 0.2 – 3) |
| <kbd>−</kbd> / <kbd>=</kbd> | Rain opacity − / + 0.02 (clamped 0 – 0.5) |
| <kbd>R</kbd> | Toggle rain on / off |

All settings persist to `localStorage` under the `lt.*` namespace
and survive cross-tab reloads via the `storage` event.

The dashboard is its own self-contained module: it builds its DOM,
injects its CSS, and never touches PaperMod's styles. It dispatches
two events:

- `lt:settings-change` — fired after any setting change. Matrix.js
  listens for this and re-reads its config.
- `lt:theme-change` — fired only on theme switch. Matrix.js listens
  for this and re-reads the active `--neon-blue` colour.

If a third script ever needs to react to settings changes, listen
for `lt:settings-change`. It is the single integration point.

---

## Matrix rain

`static/js/matrix.js` mounts a full-screen `<canvas>` behind the
content, draws 14 px monospace glyphs on a 60 fps loop, and tracks
`--neon-blue` so the colour matches the active theme.

Behaviour worth knowing:

- **Pauses on `visibilitychange`** — no GPU work in a hidden tab.
- **Boot guard**: if `lt.rain.enabled === '0'`, the canvas is never
  even created. A reload re-mounts it when the user re-enables.
- **Resize debounce** (150 ms): a window drag doesn't re-init the
  drop array 100× / sec.
- **Glyph colour is cached**: `--neon-blue` is read on theme change,
  not every frame. The previous version was 60 forced reflows / sec.
- **Fractional speed**: the slider goes 0.2× – 3× and uses a
  fractional accumulator so sub-1 speeds drop the rain correctly.

Character sets: `binary` (`01`), `ascii` (mixed), `kana`
(katakana), `hex` (`0123456789ABCDEF`).

---

## FOUC boot — `extend_head.html`

Every page emits this synchronous inline script before the
stylesheet:

```html
<script>
(function () {
  try {
    var t = localStorage.getItem('lt.theme');
    if (t && t !== 'cyberpunk') {
      document.documentElement.setAttribute('data-theme', t);
    }
  } catch (e) { /* localStorage blocked -- default theme */ }
})();
</script>
```

It runs before the bundled CSS so the very first paint already uses
the saved palette. Without it, every page-load flashes in the
default cyberpunk palette for ~80 ms before the deferred dashboard
script catches up.

The synchronous script is the one place inline JS is intentional.
Every other script is `defer`'d.

---

## Multi-domain navigation

The site is served from two domains (`fahimimam.pro.bd` and
`fahimimam.sytes.net`). Hugo's `baseURL` is the production domain,
which would otherwise make every internal link absolute and lock
visitors to it.

The fix: four PaperMod partials are overridden in
[`layouts/partials/`](./layouts/partials/) with their `absURL` /
`absLangURL` calls swapped for the host-relative `relURL` /
`relLangURL`. Files overridden:

- `header.html` — logo + main menu
- `head.html` — favicon + apple-touch + mask icons
- `footer.html` — copyright link
- `breadcrumbs.html` — home + intermediate crumbs

**What stays absolute (intentionally):**

- `<link rel="canonical">` — search engines dedupe via canonical
- RSS / JSON feed links — feed readers require absolute URLs
- OpenGraph / Twitter card tags — OG spec requires absolute URLs
- JSON-LD `url` and `@id` — schema.org requires absolute URLs
- The lunch-tracker showcase's `https://fahimimam.sytes.net/api/...`
  demo links — these are content, pointing at the actual deployed demo

To verify a clean build:

```bash
hugo --minify
grep -rh 'href="https://fahimimam' public/ | sort -u
```

The output should be limited to `index.xml` (RSS), the JSON-LD /
OpenGraph blocks, and the lunch-tracker demo URLs. No
`href="http://fahimimam…"` for navigation.

---

## /now, /uses, JSON-LD

Three small backend-engineer conventions, each handled as a separate
layout under `layouts/<section>/single.html`:

### `/now` — what I'm focused on right now

A snapshot-of-now page inspired by
[nownownow.com](https://nownownow.com/about). Frontmatter lives in
`content/now.md`; layout in `layouts/now/single.html`. Sections:

- `hero.intro` — one-paragraph framing.
- `focus[]` — each as `{area, detail}`. Cards.
- `reading[]` — each as `{title, author, status}`. Cards.
- `listening[]` and `avoiding[]` — flat string lists with custom
  bullet glyphs.

The page reuses `.about-section / .about-card / .about-grid` from the
about layout. `last_updated` is the source of truth for staleness;
update the frontmatter, not the HTML.

### `/uses` — what I use to write code

A uses.tech-style page. Frontmatter in `content/uses.md`; layout in
`layouts/uses/single.html`. Sections are driven by a `$sections` slice
in the template, in fixed order:

```go-text
{{ $sections := slice
  (dict "key" "editors"      "title" "Editor")
  (dict "key" "terminal"     "title" "Terminal & shell")
  (dict "key" "dotfiles"     "title" "Dotfiles")
  ...
}}
```

Each section in the frontmatter is a list of `{name, role, detail,
alt}`. Missing sections are skipped silently — only the ones you fill
in are rendered. The template iterates `$sections`, looks each one up
on `.Params`, and renders only the present ones.

To add a new section (e.g. "audio gear"), add its frontmatter list
and its `(dict ...)` to `$sections`. **Order in `$sections` matters**;
the title is what you want shown, the key is what you want looked up.

### Person JSON-LD on `/about`

`layouts/about/single.html` injects a `<script type="application/ld+json">`
block at the bottom of the article with a `schema.org/Person` graph.
This gives:

- A richer Google Knowledge Panel card (jobTitle, worksFor, alumniOf).
- One canonical record that search engines dedupe to.

**Important: how `jsonify` works in this template.** Hugo's
`{{ value | jsonify }}` rendered string values with literal embedded
quotes — `"name":"\"Kazi Fahim Imam\""` — because `jsonify` quotes the
Go-template string AND its stringified Go repr both get re-quoted.
The fix: don't pipe frontmatter strings through `jsonify`; emit them
inline. Hard-coded strings (URLs, organisation names) are typed
literally. `.Permalink` is JSON-encoded because it may contain `/`
and `:`.

After adding any new field, validate:

```bash
python3 -c "import re,json; \
  m=re.findall(r'<script type=application/ld\+json>(.*?)</script>', \
  open('public/about/index.html').read(), re.DOTALL); \
  print(json.dumps(json.loads(m[2]), indent=2))"
```

Should print the Person object with clean string values.

---

## Embedded code samples on showcases

Both `lunch-tracker-showcase.html` and `portfolio-showcase.html` end
with a `Code samples` section. They use Hugo's `highlight` template
function (not the shortcode — shortcodes only work in `.md` content
files, not in template HTML).

The pattern:

```go-html-template
{{ $snipName := `// literal Go code with backticks-safe content
func foo() { ... }` }}

<article class="pf-code-block">
  <h3>Section title</h3>
  <p class="pf-code-lead">Short prose explaining the snippet.</p>
  {{ highlight $snipName "go" "linenos=table,hl_lines=1 2" }}
</article>
```

Hugo's `highlight` accepts three arguments: source, language, options.
The options string is space-separated key=value pairs — `linenos=table`
adds line numbers, `hl_lines=3 5 7` highlights specific lines.

To add a new snippet:

1. Copy a block verbatim from the source file.
2. Wrap it in `{{ $name := \`...\` }}` at the top of the section.
3. Add an `<article class="pf-code-block">` with a short lead and the
   `{{ highlight ... }}` call.

CSS lives in scoped `<style>` blocks at the bottom of each showcase
file, so each page is self-contained.

---

## Adding a project

1. Create `content/projects/<slug>.md` with frontmatter:
   ```yaml
   ---
   title: "Project Name"
   date: 2026-08-15
   icon: "🚀"
   status: "live"   # live | wip | archived
   tags: ["Go", "Postgres"]
   categories: ["Projects"]
   description: "One-line."
   summary: "One-sentence summary for the projects index card."
   links:
     - { label: "Source", url: "https://github.com/…", primary: true }
     - { label: "Live",   url: "https://…" }
   ---
   ```
   The default layout is PaperMod's single template. For a custom
   full-page engineering case study (like
   `portfolio-website.md` or `lunch-tracker.md`), set
   `layout: "<showcase-name>"` and create a matching template in
   `layouts/_default/`.
2. Add a thumbnail / summary to `data/projects.json` if you want
   the card to appear on `/projects/` (the index pulls from there).
3. Rebuild. PaperMod auto-generates `/projects/<slug>/` from the
   frontmatter `title`.

---

## Smoke testing

A minimal browser mock can verify the JS bundles parse and boot
without throwing. There's a one-shot pattern:

```bash
node -e "
  const fs = require('fs');
  const stub = (s) => ({ /* …all the DOM methods the script touches… */ });
  globalThis.document = stub('document');
  globalThis.window = stub('window');
  globalThis.localStorage = { getItem() { return null; }, setItem() {} };
  globalThis.getComputedStyle = () => ({ getPropertyValue: () => '' });
  globalThis.requestAnimationFrame = () => 0;
  globalThis.cancelAnimationFrame = () => {};
  try { eval(fs.readFileSync('public/js/matrix.js', 'utf8')); }
  catch (e) { console.error(e); process.exit(1); }
  try { eval(fs.readFileSync('public/js/theme-dashboard.js', 'utf8')); }
  catch (e) { console.error(e); process.exit(1); }
  console.log('OK');
"
```

It's a syntactic and runtime floor, not a test framework — catches
"this script can't even load" regressions.

---

## Common pitfalls

- **Don't add `data-theme` to a PaperMod partial override without
  checking `absURL` calls.** PaperMod's defaults use absolute URLs
  everywhere; copying a partial verbatim will re-introduce the
  host-locking bug.

- **Don't add inline `<style>` blocks on non-home pages.** Hugo's
  bundle is loaded by `head.html`, so adding per-page inline styles
  creates load-order surprises. Either move styles to
  `assets/css/extended/*.css` (auto-bundled) or scope them to a
  template.

- **Don't add a `:root[data-theme="X"]` block without all 17
  tokens.** Missing tokens fall through to the bare `:root`
  fallback, which usually means a near-invisible color — themes
  look subtly wrong and you can't tell why.

- **Don't ship a JS file in `static/js/` that uses imports /
  requires.** The site ships no bundler and the defer scripts must
  work as plain ES5. Keep it `var`, IIFE-wrapped, no module syntax.

---

## Live domain check

## Landing page (`/`)

`layouts/index.html` overrides PaperMod's `index.html` with the
hero/terminal/CTA stack. The page is split across three files:

- `layouts/index.html` — markup only (114 lines). Reads from the
  two data files for any copy that changes.
- `assets/css/extended/home.css` — all home-page CSS. Picked up
  automatically by PaperMod's `resources.Match "css/extended/*.css"`
  in `themes/PaperMod/layouts/partials/head.html`, so it gets
  minified, fingerprinted, and cached by the browser rather than
  shipping in the HTML on every visit.
- `data/home.json` — card copy (status text, availability,
  role/stack lines).
- `data/terminal.json` — every line of the terminal, in order.

### Updating the terminal feed

Each entry in `data/terminal.lines` is one of:

| `type`      | fields              | renders as                              |
|-------------|---------------------|-----------------------------------------|
| `prompt`    | `command`           | `~$ <command>`                          |
| `typing`    | `value`             | typewriter-animated line                |
| `skills`    | `values: [...]`     | flex row of pills                       |
| `info`      | `value`             | plain monospace output (no animation)   |
| `cursor`    | —                   | blinking `▋` after a prompt             |

To add a new engineering line to the hero, append a `prompt`
+ `info` pair:

```json
{ "type": "prompt", "command": "echo '// something I shipped'" },
{ "type": "info",   "value":   "// something I shipped" },
```

The `nth-of-type` stagger in `home.css` keeps the typing
animation in sync for the first 4 typing lines and uses a generic
fallback for any beyond that.

### Mobile restack

On screens ≤768px, the CSS `order` property reshuffles the
hero-content stack so CTA buttons and the ghost row land above
the shell (card + terminal). The shell is the tall content; the
CTAs are decision-ready — they should be the first thing a phone
visitor sees.

### Reduced motion

`home.css` ends with a `@media (prefers-reduced-motion: reduce)`
block that disables every keyframed animation on the page when
the user has set their OS-level preference. Visual effects remain;
they just stop moving.

| Domain | What it serves |
|---|---|
| `https://fahimimam.pro.bd` | Production. The `baseURL`. |
| `https://fahimimam.sytes.net` | Mirror. Same build, different host. |

Both serve the same `public/` directory on the VPS — Nginx
distinguishes them by `Host` header and serves the same files.

A visitor arriving on `sytes.net` and clicking "Blog" stays on
`sytes.net/blog/`. A visitor arriving on `pro.bd` and clicking
"Blog" stays on `pro.bd/blog/`. That's the entire reason for the
partial overrides in this repo.

---

## Blog

### Authoring posts

```bash
hugo new blog/<slug>.md
```

The `archetypes/blog.md` archetype scaffolds a post with all the
fields the rest of the system relies on: `title`, `date`, `draft`,
`summary`, `tags`, `categories`, `series`, `series_part`, `cover`,
`ShowToc`, `hideFromSearch`. Edit the frontmatter, write the body,
flip `draft: false`. Done.

When `hideFromSearch: true`, the post is excluded from the
site-wide search index. Use for stubs and in-progress notes you
don't want showing up at `/search/`.

### Series badge

Set `series` and `series_part` in the post's frontmatter:

```yaml
series: "Hugo deployment postmortems"
series_part: 1
```

The overridden `layouts/partials/post_meta.html` renders a
`Part N of <Series>` chip in the post meta row (visible on both
the post header and the list-card footer). `series_part: 0`
suppresses the badge — that's the convention for series index
pages.

The series name is rendered as plain text, not a link. A future
iteration could add a `series` taxonomy so each series gets a
landing page at `/series/<slug>/`.

### Custom blog list

`layouts/blog/list.html` overrides PaperMod's default section list
for `/blog/`. It adds:

- A hero band carrying the `_index.md` description.
- A **"Start a new post" CTA card** (see below).
- A tag chip filter row (one chip per tag actually used in
  `/blog/`). Each chip links to `/tags/<slug>/`. "All" links back
  to `/blog/`.
- The latest post rendered as PaperMod's `.first-entry` card; the
  rest as `.post-entry` cards via the `post_card.html` partial.

The per-card markup lives in `layouts/partials/post_card.html`,
not duplicated inside the list. Other sections (e.g. tag landing
pages, archives) still use PaperMod's default.

### Write CTA on `/blog/`

The blog list carries a CTA card under the hero band that turns
the page into a writing surface rather than just a feed. It has:

- The `hugo new blog/<slug>.md` command in a copyable chip —
  `navigator.clipboard` on HTTPS, `document.execCommand` fallback
  for plain HTTP localhost previews. The button flips label to
  "copied" for 1.5s on success.
- A collapsible "Show the archetype template" `<details>` that
  reads `archetypes/blog.md` from disk via `readFile` and renders
  it verbatim. Whatever the archetype looks like is what the
  author sees on the page — keep them in sync.
- An "Edit the archetype on GitHub" link to
  `https://github.com/fahimimam/portfolio/blob/main/archetypes/blog.md`.

To hide the CTA (e.g. for a public landing that should read as a
feed, not a writing surface), set in `content/blog/_index.md`:

```yaml
---
title: "Blog"
hideWriteCTA: true
---
```

The CTA is built in markup + scoped CSS + an inline `<script>`
(wired idempotently under `window.__blogWriteCTAWired`), all
inside `layouts/blog/list.html` — no separate JS asset is shipped.

### Site search

Powered by PaperMod's bundled Fuse.js (`assets/js/fastsearch.js`).
Enabled in `hugo.toml` under `[params.search]` with the index
provided by the overridden `layouts/_default/index.json`.

**The index scope is the override's whole job.** PaperMod's default
`index.json` (in the theme) emits every page — including `/about/`,
`/cv/`, the search page itself, and every taxonomy landing page.
Our override narrows the index to two section kinds:

```go-html-template
{{- range where site.RegularPages "Section" "in" (slice "blog" "projects") -}}
    {{- if not .Params.hideFromSearch -}}
        {{- $.Scratch.Add "index" (dict "title" ... "permalink" ... "summary" ... ) -}}
    {{- end -}}
{{- end -}}
```

To include another section (e.g. a future `/talks/` section), add
its name to the `slice` and rebuild.

To disable search entirely, set `[params.search] enable = false`
in `hugo.toml` and remove the `[[menu.main]]` entry pointing at
`/search/`. The `/search/` page will 404 (or render PaperMod's
un-enabled template) but the JS index won't be requested by the
disabled fastsearch.

To verify the index scope after a build:

```bash
python3 -c "import json; \
  print(sorted({p['section'] for p in json.load(open('public/index.json'))}))"
```

Expected output: `['blog', 'projects']`. Anything else means a
post slipped into the wrong section, or a new section was added
without updating the slice.