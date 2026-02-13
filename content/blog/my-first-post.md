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
GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -ldflags="-s -w" -o app-linux main.go