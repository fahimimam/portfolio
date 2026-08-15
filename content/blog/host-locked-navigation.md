---
title: "The bug that locked every visitor to one domain"
date: 2026-08-15
draft: false
summary: "Hugo's baseURL makes every internal link absolute. That's fine for one domain. The moment you serve the same site from two domains, it's a navigation bug."
tags: ["Hugo", "PaperMod", "Multi-domain", "Bugs"]
categories: ["Blog", "Hugo"]
series: "Hugo deployment postmortems"
series_part: 1
cover: { image: "", alt: "" }
ShowToc: false
hideFromSearch: false
---

The portfolio site is served from two domains — `fahimimam.pro.bd` and `fahimimam.sytes.net` — from the same `public/` directory on the same VPS. Nginx picks the right one by `Host` header. Same files, no redirects, no per-domain rebuilds.

That part works. What didn't work was every visitor getting yanked back to `pro.bd` on the first click.

## What the bug looked like

Open `https://fahimimam.sytes.net/about/` in a browser. Click any link in the navigation — say, "Projects". You land on `https://fahimimam.pro.bd/projects/`. The mirror is dead weight.

This was the symptom. The cause was structural.

## The cause: every internal link was absolute

Hugo has a `baseURL` setting. The default behavior of `absURL` (and `absLangURL`) is to resolve a path against `baseURL` and emit an absolute URL. PaperMod's templates use these everywhere — header navigation, breadcrumbs, footer, favicon, head icons.

When you serve from one domain, that's correct: every link is a fully-qualified URL pointing at the production host. When you serve from two domains, it's a navigation bug: every link silently redirects visitors to whatever `baseURL` says, regardless of which domain they came from.

I had two options:

1. **Build twice.** One build per domain, each with its own `baseURL`. Doubles the deploy time, doubles the storage, and the two builds would have to stay in sync. No.
2. **Make every internal link host-relative.** A single build that works on any domain.

Option 2 is the right answer. The fix is small but requires overriding several PaperMod partials.

## The fix: four partial overrides

Hugo's template lookup lets you shadow a theme's template by placing the same path under `layouts/`. The theme stays untouched; only the partials I want to change get overridden. I copied four PaperMod partials into `layouts/partials/` and replaced the `absURL`/`absLangURL` calls with their host-relative siblings:

| Partial | Was | Became |
|---|---|---|
| `header.html` | logo + main menu use `absURL`/`absLangURL` | use `relURL`/`relLangURL` |
| `head.html` | favicon + apple-touch + mask icons use `absURL` | use `relURL` |
| `footer.html` | copyright link uses `absURL` | use `relURL` |
| `breadcrumbs.html` | Home + intermediate crumbs use `absLangURL` / `Permalink` | use `relLangURL` / `RelPermalink` |

That's the whole change. A single sed-like find-and-replace across four files.

## What stays absolute — and why

Not every URL on the page should be host-relative. Some need to stay absolute on purpose:

- **`<link rel="canonical">`** — search engines dedupe cross-domain signals via canonical, and the canonical URL must point at one specific host.
- **RSS / JSON feed links** — feed readers fetch them out of band; relative URLs don't work.
- **OpenGraph / Twitter card tags** — the OG spec requires absolute URLs.
- **JSON-LD `url` and `@id`** — schema.org requires absolute URLs.

So the rule is: **navigation links are relative; metadata links are absolute.** Verifying the build obeys this is one grep:

```bash
hugo --minify
grep -rh 'href="https://fahimimam' public/ | sort -u
```

The output should be limited to `index.xml`, the JSON-LD blocks, the OG / Twitter meta tags, and the lunch-tracker demo URLs (those point at the actual deployed demo, not internal navigation). If you see `href="https://fahimimam..."` anywhere else, a partial override is missing.

## Lessons

The lesson isn't "Hugo has a bug." The lesson is: **default behaviors that don't fail loudly on the happy path are the most expensive ones to discover later.** Two-domain serving is a niche requirement, so nobody writes a test for it. The bug lived in the gap between PaperMod's "always absolute" template and my "sometimes multi-domain" deployment.

The fix isn't worth shipping upstream — Hugo's `baseURL` model is correct for the 99% case. But the override pattern is general: any time a framework's defaults optimize for the common case and you need different behavior for your case, shadow the partial, not the whole theme. The override is small, surgical, and easy to revert.