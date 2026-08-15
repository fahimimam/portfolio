---
title: "Now"
description: "What Kazi Fahim Imam is focused on right now."
layout: "now"
last_updated: 2026-08-15

hero:
  intro: >
    This is a <strong>/now</strong> page — a snapshot of what I'm focused on
    right now. Inspired by Derek Sivers and the
    <a href="https://nownownow.com/about" target="_blank" rel="noopener">nownownow.com</a>
    movement. Updated whenever something material changes; the
    <code>last_updated</code> date below is the source of truth.

focus:
  - area: "Production reliability at Pathao"
    detail: >
      P2P send-money flows in Go — owning the recent-contacts service,
      cutting p99 latency with the new LRU cache, and stabilising
      memory on the legacy semaphore code paths.

  - area: "Engineering depth"
    detail: >
      Reading the Go runtime source on a Sunday morning. Spent August
      on the scheduler, GMP model, and netpoll internals.

  - area: "Public writing"
    detail: >
      Drafting a long-form post on graceful shutdown patterns for
      long-lived Go services (signal.NotifyContext, draining
      http.Server, in-flight requests). Targeting the Pathao internal
      blog.

  - area: "Side project"
    detail: >
      A small CLI tool for benchmarking Postgres query plans
      (<code>EXPLAIN ANALYZE</code> across many rows). Half-built;
      hoping to ship a v0.1 before September.

listening:
  - "Talos — Back to the Factory"
  - "Brian Eno — Music for Airports (yes, while coding)"
  - "Rishloo — Living as a Ghost"

reading:
  - title: "Designing Data-Intensive Applications"
    author: "Martin Kleppmann"
    status: "Re-read; chapter 5 (replication) open on the desk."

  - title: "Concurrency in Go"
    author: "Katherine Cox-Buday"
    status: "Finished last month. Notes going up on the blog soon."

  - title: "The Pragmatic Programmer (20th anniversary ed.)"
    author: "Hunt & Thomas"
    status: "A few pages a night."

  - title: "Crafting Interpreters (Part III)"
    author: "Robert Nystrom"
    status: "Bookmark in chapter 16. Worth the slow pace."

avoiding:
  - "Rushing into a new framework when the existing one is the actual bottleneck."
  - "Premature microservices — every new boundary needs to earn its keep."
  - "Micro-benchmark theatre. Real workload, real numbers."

contact_again:
  - { label: "About",  url: "/about/" }
  - { label: "Email",  url: "mailto:fahimimam@iut-dhaka.edu" }
---