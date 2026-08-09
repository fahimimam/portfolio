---
title: "Lunch Tracker"
date: 2026-08-09
draft: false
icon: "🍱"
status: "wip"
tags: ["Go", "SQLite", "REST"]
categories: ["Projects"]
summary: "A daily lunch logger — track what I eat, where, and the cost. Surfaces patterns over time."
links:
  - { label: "Source", url: "https://github.com/fahimimam/lunch-tracker", primary: true }
---

## Overview

Born from a simple question: *"How much am I actually spending on lunch, and where?"*
A two-tap logging app: tap to record today's lunch, optional place and price, done.

## Stack

- **Backend:** Go
- **Storage:** SQLite (single file, easy backup, zero ops)
- **API:** Plain REST + a tiny static HTML client
- **Deployment:** Same VPS as everything else

## Status

🚧 Active development. Logging works; stats and weekly view are next.

## Features

- One-tap logging from a static HTML page
- Optional place (home, office canteen, restaurant name, …)
- Optional price
- Edit / delete from the same day
- Weekly and monthly aggregates: total spend, average per lunch, top 3 places
- Simple CSV export

## Why SQLite

A personal lunch log is small (one row per day, forever) and read-mostly.
PostgreSQL would be overkill, and a single-file database means a `cp` is a complete backup.

## Repository

[github.com/fahimimam/lunch-tracker](https://github.com/fahimimam/lunch-tracker)