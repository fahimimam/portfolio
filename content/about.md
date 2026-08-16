---
title: "About"
description: "Backend Software Engineer (Golang) · IUT graduate · building and scaling Go services in production. Currently Software Engineer II at Pathao."
layout: "about"

hero:
  name: "Kazi Fahim Imam"
  title: "Backend Software Engineer (Golang)"
  location: "Dhaka, Bangladesh"
  contact:
    - '✉ <a href="mailto:fahimimam@iut-dhaka.edu">fahimimam@iut-dhaka.edu</a>'
    - '☎ +880 1763-869944'
    - '<a href="https://www.linkedin.com/in/kazi-fahim-imam-0027081a1/" target="_blank" rel="noopener">linkedin.com/in/kazi-fahim</a>'
    - '<a href="https://www.github.com/fahimimam" target="_blank" rel="noopener">github.com/fahimimam</a>'

summary:
  lead: >
    Backend Software Engineer with 3+ years of experience building and
    scaling services in <strong>Go (Golang)</strong> in production
    environments. Currently <strong>Software Engineer II at Pathao</strong>,
    focused on backend reliability, performance, and system design.
    IUT-graduated Computer Science Engineer with a strong foundation in
    data structures, algorithms, and distributed systems.

experience:
  - role: "Software Engineer II — Backend"
    company: "Pathao"
    location: "Dhaka, Bangladesh"
    when: "Jan 2026 – Present"
    bullets:
      - "<strong>Concurrency Optimization:</strong> Refactored legacy asynchronous algorithms by replacing unconstrained semaphore-driven goroutine spawning with a fixed-size <strong>Worker Pool</strong> pattern in <strong>Go</strong>, ensuring stable memory footprint and predictable resource utilization."
      - "<strong>System Design & Caching:</strong> Designing a 'recent contacts' service for P2P send/request money flows, architecting an <strong>LRU caching mechanism</strong> to guarantee low-latency data retrieval and optimize database load."
      - "<strong>Mentorship:</strong> Onboarded and mentored a new engineer, guiding them through the codebase and development workflows to accelerate their ramp-up to full productivity."
      - "<strong>Cross-Team Tooling:</strong> Collaborated with the Web Dev team to build a self-service portal for Mobile Recharge packages, eliminating manual SQL entry and enabling dynamic, error-free package management."
    stack: "Go, PostgreSQL, Redis, Microservices"

  - role: "Software Engineer I — Backend"
    company: "Pathao"
    location: "Dhaka, Bangladesh"
    when: "Dec 2022 – 2026"
    bullets:
      - "<strong>Optimized User Onboarding:</strong> Accelerated the signup flow by migrating temporary state data from PostgreSQL to <strong>RedisJSON</strong>, significantly reducing latency."
      - "<strong>System Observability:</strong> Engineered a centralized logging library with distributed request-ID tracing across <strong>20+ microservices</strong>, dramatically reducing production debugging time."
      - "<strong>Secure Fintech Integrations:</strong> Spearheaded direct fund integrations with Nagad and City Bank, securing financial communications with <strong>AES-CBC encryption</strong> and <strong>HMAC signature validation</strong>."
      - "<strong>Automated Reconciliation:</strong> Architected a Dead Letter Queue (DLQ) mechanism to handle transaction failures, automating financial reconciliation and reducing manual workload for the finance team."
      - "<strong>Architectural Resilience:</strong> Decoupled eKYC verification into an asynchronous process to bypass external portal downtimes, severely dropping signup failure rates."
      - "<strong>Merchant Platform:</strong> Built core backend modules for the Merchant portal, including merchant onboarding, MFS withdrawals, and beneficiary management."
    stack: "Go, PostgreSQL, Redis, Docker, Kubernetes"

projects:
  - name: "ReadU"
    summary: >
      Personal reading-tracker application. Designed the data model and
      core CRUD flows end-to-end.
    link: "https://github.com/fahimimam/ReadU-final"

  - name: "Dynamic Blog Website"
    summary: >
      Full-stack blog with secure authentication and a commenting system.
    link: "https://github.com/fahimimam/blog_Website_Dynamic"

  - name: "Cricket Game Recreation"
    summary: >
      OOP-based simulation project in C++ — third-semester OOP coursework.
    link: "https://github.com/fahimimam/OOP-project-sem-3"

skills:
  - group: "Languages"
    items: "Go (Golang), Python, C++, C#, PHP, JavaScript"

  - group: "Backend & APIs"
    items: "REST APIs, Chi, Fiber, Microservices"

  - group: "Databases & Caching"
    items: "MySQL, PostgreSQL, Redis"

  - group: "Infrastructure"
    items: "Docker, Kubernetes, CI/CD, Git"

  - group: "Core Concepts"
    items: "Data Structures & Algorithms, OOP, System Design, Concurrency"

education:
  - degree: "B.Sc. in Computer Science and Engineering"
    institution: "Islamic University of Technology (IUT)"
    location: "Dhaka, Bangladesh"
    when: "2018 – 2022 · CGPA 3.17 / 4.0"

  - degree: "Higher Secondary Certificate (HSC)"
    institution: "Govt. Rajendra College"
    location: "Faridpur, Bangladesh"
    when: "2017 · GPA 5.00 / 5.00"

  - degree: "Secondary School Certificate (SSC)"
    institution: "Faridpur Zilla School"
    location: "Faridpur, Bangladesh"
    when: "2015 · GPA 5.00 / 5.00"

thesis:
  title: "An End-to-End System for Handwritten Bangla Character Recognition"
  summary: >
    Designed a pipeline to segment Bangla documents down to individual
    characters and classify them using multiple CNN architectures.

profiles:
  - { label: "Codeforces · fahimimam",        url: "https://codeforces.com/profile/fahimimam" }
  - { label: "StopStalk · fahimimam98",       url: "https://www.stopstalk.com/user/profile/fahimimam98" }
  - { label: "LeetCode · fahimimam",          url: "https://leetcode.com/fahimimam/" }
  - { label: "uHunt · 1045189",               url: "https://uhunt.onlinejudge.org/id/1045189" }

contact_again:
  - { label: "View CV",   url: "/cv/" }
  - { label: "Projects",  url: "/projects/" }
  - { label: "Email me",  url: "mailto:fahimimam@iut-dhaka.edu" }
---

## TL;DR

Backend Software Engineer focused on Go (Golang) services in production.
Currently Software Engineer II at Pathao, with three-plus years of
backend work behind it. IUT graduate.