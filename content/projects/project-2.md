---
title: "Portfolio Website with Hugo"
date: 2024-02-06
draft: false
tags: ["Hugo", "Go", "Static Site"]
categories: ["Projects"]
summary: "Lightning-fast portfolio website using Hugo static site generator"
---

# Portfolio Website

This very website! Built with Hugo and deployed on a resource-constrained VPS.

## Why Hugo?

- **Speed:** Static files served in milliseconds
- **Efficiency:** Only 10MB RAM usage
- **Simplicity:** No backend required
- **Flexibility:** Can add dynamic features later

## Deployment

Built locally on MacBook Air M3, cross-compiled, and deployed via rsync:

```bash
hugo build --minify
rsync -avz public/ vps:/var/www/portfolio/