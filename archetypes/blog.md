---
title: "{{ replace .File.ContentBaseName "-" " " | title }}"
date: {{ .Date }}
draft: true
summary: ""
tags: []
categories: ["Blog"]
series: ""
series_part: 0
cover: { image: "", alt: "" }
ShowToc: false
hideFromSearch: false
---

Write your post body here.

Conventions:

- One paragraph per line — the renderer doesn't care, but diffs do.
- Wrap code blocks with triple backticks and a language tag for
  syntax highlighting.
- Cross-link to a project page with `/projects/<slug>/` (host-relative,
  works on both domains).
- If the post is part of a multi-part series, set `series` to the series
  title and `series_part` to the position (1-indexed). The post_meta
  override renders this as a `Part N of <Series>` badge under the title.
- If the post is the canonical index for a series (the "table of
  contents" page), leave `series_part: 0`.
- Set `hideFromSearch: true` for posts that are stubs or in-progress
  notes you don't want showing up in `/search/`.
- Set `ShowToc: true` for posts long enough to benefit from a heading
  sidebar (usually > 1000 words).
- The first paragraph is excerpted into the list-card preview if you
  set `summary`, otherwise the renderer falls back to the first
  ~160 chars of the body.
