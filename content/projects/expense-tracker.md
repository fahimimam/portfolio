---
title: "Expense Tracker"
date: 2026-08-09
draft: false
icon: "💸"
status: "wip"
tags: ["Go", "PostgreSQL", "HTMX", "Docker"]
categories: ["Projects"]
summary: "A personal finance tracker for categorizing expenses, setting monthly budgets, and visualizing where the money goes."
links:
  - { label: "Source", url: "https://github.com/fahimimam/expense-tracker", primary: true }
---

## Overview

A self-hosted expense tracker built to replace the spreadsheet I had been using for years.
The goal is small surface area, fast keyboard-driven input, and charts that answer
"where did the money go this month?" without requiring a SaaS account.

## Stack

- **Backend:** Go (standard library + [`chi`](https://github.com/go-chi/chi) router)
- **Database:** PostgreSQL
- **Frontend:** Server-rendered HTML + HTMX — no SPA, no build step
- **Deployment:** Single binary on my VPS, reverse-proxied through Caddy

## Status

🚧 Active development. Core schema and CRUD are in place; charts and CSV import are next.

## Planned features

- [x] Add / edit / delete transactions
- [x] Categories with custom color per category
- [x] Monthly budget per category with over-budget warnings
- [ ] Charts (spend by category, month-over-month trend)
- [ ] CSV import from bank statements
- [ ] Multi-currency
- [ ] Mobile-friendly quick-add form

## Why HTMX?

The interaction model is "submit form, see result." That maps perfectly to server-rendered
HTML and HTMX swaps — no JSON API, no React hydration, no state management.
The whole app fits in a single binary and the entire stack runs on ~30MB RAM.

## Repository

[github.com/fahimimam/expense-tracker](https://github.com/fahimimam/expense-tracker)
