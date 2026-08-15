---
title: "Uses"
description: "The editor, terminal, dotfiles, services and hardware Kazi Fahim Imam uses day to day."
layout: "uses"
last_updated: 2026-08-15

intro: >
  Inspired by <a href="https://uses.tech" target="_blank" rel="noopener">uses.tech</a>,
  this is the running list of what I use to write code, run services,
  and stay productive. I update it when something materially changes —
  not every time I try a new font.

editors:
  - name: "Neovim"
    role: "Primary editor for Go, Python, Markdown, everything."
    detail: >
      Config is Lua, custom plugins live under
      <code>~/.config/nvim/lua/user/</code>. Leader key is space;
      LSP via <code>nvim-lspconfig</code>, completion via
      <code>nvim-cmp</code>, fuzzy finding via <code>telescope.nvim</code>.
    alt: "I've also been on JetBrains GoLand for the rare deep debugging session — the inline struct field inspector is still unmatched."

terminal:
  - name: "Ghostty"
    role: "Daily driver terminal."
    detail: >
      Native, GPU-rendered, fast. Config is TOML, kept under
      <code>~/.config/ghostty/config</code>. One window, many tabs,
      tmux inside for panes — splits feel right with
      <kbd>Ctrl</kbd>+<kbd>b</kbd> + <kbd>%</kbd>.

  - name: "tmux"
    role: "Session persistence + pane splits."
    detail: >
      <code>tmux-resurrect</code> saves layouts across reboots. Prefix
      remapped from <kbd>Ctrl</kbd>+<kbd>b</kbd> to
      <kbd>Ctrl</kbd>+<kbd>a</kbd> out of long habit.

  - name: "fish shell"
    role: "Interactive shell."
    detail: >
      Autosuggestions out of the box. <code>fzf</code> integration
      through <code>fzf.fish</code>. Scripts get <code>#!/usr/bin/env bash</code>
      instead — fish syntax doesn't survive being called as
      <code>sh</code>.

dotfiles:
  - name: "Git config"
    role: "Aliases, rerere, delta as the pager."
    detail: >
      <code>git config --global include.path ~/.config/git/config</code>
      keeps machine-specific blocks out of the main file. Delta renders
      diffs side-by-side with theme colours.

  - name: "Starship prompt"
    role: "Cross-shell prompt that just works."
    detail: >
      Custom module for the active Go module path. Battery indicator
      on the laptop only — the VPS box has no UPS.

  - name: "GNU stow"
    role: "Manages the dotfiles repo."
    detail: >
      Each tool is its own package directory; <code>stow &lt;tool&gt;</code>
      symlinks into <code>$HOME</code>.

go_toolchain:
  - name: "Go"
    role: "Primary language."
    detail: >
      Pinned to the latest two minor releases — currently 1.23 / 1.24.
      <code>go.work</code> for multi-module local development.

  - name: "golangci-lint"
    role: "The linter, the whole linter, and nothing but the linter."
    detail: >
      <code>.golangci.yml</code> at the repo root. Enabled:
      <code>errcheck</code>, <code>gosec</code>, <code>staticcheck</code>,
      <code>govet</code>, <code>gofmt</code>. Disabled: most of the
      pedantic group — they bikeshed more than they catch.

  - name: "Delve (dlv)"
    role: "Debugger when printf-debugging stops being enough."
    detail: >
      <code>dlv debug --headless --listen=:2345</code> + Neovim's
      <code>:DapContinue</code> for remote debugging against staging.

ops:
  - name: "Docker + docker compose"
    role: "Local infra for Postgres / Redis / a tiny Kafka."
    detail: >
      <code>make up</code> brings the whole stack online;
      <code>make down</code> tears it down. Compose files are
      hand-written, no Helm — too much overhead for a laptop.

  - name: "k9s"
    role: "When I have to look at the cluster."
    detail: >
      Most of the time I should be looking at dashboards instead.
      k9s is the fallback when the dashboard is broken, which is
      always at the worst possible moment.

  - name: "kubectl + jq + gron"
    role: "The CLI trio."
    detail: >
      <code>kubectl get ... -o json | jq '.items[] | .metadata.name'</code>.
      <code>gron</code> flattens nested JSON to grep-able assignments
      when jq's selectors start to hurt.

services:
  - name: "GitHub"
    role: "Source control, CI, package registry."
    detail: >
      Personal repos on the free tier; private repos for the lunch-tracker
      code. Actions for CI; no third-party CI vendor.

  - name: "DigitalOcean"
    role: "VPS for the portfolio."
    detail: >
      One $6 droplet, Nginx in front, rsync-on-deploy. Six months
      uptime so far, which is more than I expected for the price.

  - name: "Tailscale"
    role: "WireGuard mesh to the VPS."
    detail: >
      Replaced an SSH jump host. The VPS advertises its Tailscale IP
      as a DNS name; deploys are <code>rsync public/ fahim@portfolio:...</code>.

hardware:
  - name: "MacBook Pro 14\" (M3 Pro, 18 GB)"
    role: "Daily driver."
    detail: >
      Bought mid-2024. 512 GB SSD is the only regret — Docker images
      eat it alive. Plugged into a single LG 27\" 4K monitor at home.

  - name: "Custom Mini-ITX desktop (Ryzen 7, 32 GB, 1 TB NVMe)"
    role: "Linux box for the heavier workloads."
    detail: >
      Runs Fedora 40 with Wayland. This is where the Go compiler
      stops complaining about my fan noise. Used as a remote
      build/test box over Tailscale when the Mac gets hot.

  - name: "Logitech MX Master 3S"
    role: "Mouse."
    detail: >
      Thumb-scroll horizontal is the killer feature for code review.

browser:
  - name: "Firefox Developer Edition"
    role: "Default browser."
    detail: >
      Container tabs for separating work / personal / shopping logins.
      Tree Style Tab extension because vertical tabs are non-negotiable
      on a 4K monitor.

contact_again:
  - { label: "About",   url: "/about/" }
  - { label: "Now",     url: "/now/" }
  - { label: "Email",   url: "mailto:fahimimam@iut-dhaka.edu" }
---