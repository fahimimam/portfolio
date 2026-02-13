---
title: "Chat Application with WebSockets"
date: 2024-01-15
draft: false
tags: ["Go", "WebSockets", "Redis"]
categories: ["Projects"]
summary: "Real-time chat application built with Go, WebSockets, and Redis"
---

# Chat Application

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

## Links

- [GitHub Repository](https://github.com/fahimimam/chat-app)
- [Live Demo](https://chat.fahimimam.pro.bd)

## Screenshots

![Chat Interface](/images/projects/chat-app.png)

## Challenges & Solutions

One of the main challenges was handling multiple WebSocket connections efficiently...