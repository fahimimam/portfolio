---
title: "Portfolio Website"
date: 2024-02-06
draft: false
icon: "🌐"
status: "live"
tags: ["Hugo", "Static Site", "VPS"]
categories: ["Projects"]
summary: "Hugo static site, deployed via rsync on a 1-core 2GB VPS using only ~10MB RAM."
links:
  - { label: "Source", url: "https://github.com/fahimimam/portfolio", primary: true }
---

This very website! Built with Hugo and deployed on a resource-constrained VPS.

## Why Hugo?

- **Speed:** Static files served in milliseconds
- **Efficiency:** Only ~10MB RAM usage for the entire site
- **Simplicity:** No backend required
- **Flexibility:** Can add dynamic features later

## Deployment

Built locally on MacBook Air M3, cross-compiled, and deployed via rsync:

```bash
hugo build --minify
rsync -avz public/ vps:/var/www/portfolio/
```

## Stack

- **Generator:** Hugo
- **Theme:** [PaperMod](https://github.com/adityatelange/hugo-PaperMod) (heavily customized)
- **Hosting:** Nginx on a 1-core, 2GB RAM VPS
- **Deploy:** `deploy.sh` — single command

The theme is PaperMod with a custom cyberpunk overlay — neon-blue accents, monospace fonts, animated terminal on the home page, and a subtle matrix-rain background on inner pages.