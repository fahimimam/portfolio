---
title: "Chat Application"
date: 2024-01-15
draft: false
icon: "💬"
status: "live"
tags: ["Go", "WebSockets", "Redis", "PostgreSQL"]
categories: ["Projects"]
summary: "Real-time chat built with Go, WebSockets, and Redis pub/sub for horizontal scaling."
links:
  - { label: "Live", url: "https://chat.fahimimam.pro.bd", primary: true }
  - { label: "Source", url: "https://github.com/fahimimam/chat-app" }
---

A real-time chat application built with Go, featuring WebSocket connections and Redis pub/sub for scalability.

## Features

- Real-time messaging using WebSockets
- Redis pub/sub for horizontal scaling
- JWT authentication
- Message history persistence
- Typing indicators

## Tech Stack

- **Backend:** Go (Fiber framework)
- **Database:** PostgreSQL
- **Cache:** Redis
- **Frontend:** Vanilla JavaScript
- **Deployment:** Docker Compose

## Challenges & Solutions

The main challenge was horizontal scaling. With a single Go process, every WebSocket connection sits in the same memory
space and a message can be routed to its recipient in O(1). With multiple Go processes behind a load balancer, two users
connected to *different* nodes cannot message each other directly — they live in separate processes.

The fix is Redis pub/sub: each node publishes every outgoing message to a Redis channel and subscribes to incoming
messages from the same channel. When a message comes in, the node fans it out to whichever local sockets match the
recipient. The result is a chat server that scales horizontally with no application-level awareness of how many nodes
exist.
