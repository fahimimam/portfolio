---
title: "Lunch Tracker"
date: 2026-08-15
draft: false
icon: "🍱"
status: "live"
tags: ["Go", "Vanilla JS", "Tampermonkey", "Nginx", "systemd"]
categories: ["Projects"]
description: "A personal lunch-eligibility countdown kept in sync between the Pathao HRMS web UI and a tiny Go backend — so I always know when I'm allowed to step away for lunch."
summary: "A live lunch-eligibility countdown kept in sync between the Pathao HRMS web UI and a tiny Go backend. See the engineering case study below."
layout: "lunch-tracker-showcase"
hideMeta: true
links:
  - { label: "Live API", url: "https://fahimimam.sytes.net/api/lunch/state", primary: true }
  - { label: "Widget", url: "https://fahimimam.sytes.net/api/lunch/widget" }
  - { label: "Source", url: "https://github.com/fahimimam/lunch-tracker" }
---

A personal lunch-eligibility tracker. The policy at my workplace is
**6 hours 45 minutes after clock-in → eligible for lunch**, and this
project exists so I never have to remember the math. The full
engineering case study — problem, architecture, challenges, API,
deployment, lessons — is rendered on the page below.