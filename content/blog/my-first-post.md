---
title: "Optimizing VPS Deployment: Binary Uploads vs Docker"
date: 2024-02-06
draft: false
tags: ["DevOps", "Go", "VPS", "Docker"]
categories: ["Blog", "DevOps"]
summary: "How I optimized my VPS deployment strategy to save resources"
---

# Optimizing VPS Deployment

When you're working with a resource-constrained VPS (1 core, 2GB RAM), every megabyte counts. Here's how I optimized my deployment strategy.

## The Challenge

I have a VPS with:
- 1 CPU core
- 2GB RAM
- 25GB SSD

I needed to run:
- Portfolio website
- Chat application
- PostgreSQL
- Redis

## The Solution: Binary Uploads

Instead of using Docker for everything, I decided to:

1. **Build locally** on my MacBook Air M3
2. **Cross-compile** for Linux
3. **Upload binaries** via SCP
4. **Run natively** on VPS

### Build Script

```bash
#!/bin/bash
GOOS=linux GOARCH=amd64 CGO_ENABLED=0 \
    go build -ldflags="-s -w" -o app-linux main.go
```

The flags `-s -w` strip the symbol table and DWARF debug info, which
typically cuts the binary size by 20–30%.

### Why this matters

A statically-linked Go binary uses ~10MB of RAM at idle. The same
application inside a Docker container typically uses 30–60MB once you
count the daemon, container layers, and overlay filesystem. On a 2GB
box, that difference is the difference between running four services
and running one.

### When Docker still makes sense

For complex multi-service stacks where reproducibility matters more than
RAM — staging environments, CI, anything you throw away after a day —
Docker is still the right tool. The point isn't to avoid Docker
entirely, it's to match the deployment shape to the workload.