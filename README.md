# ksha - Intelligent Information Stream Processing Engine

<div align="center">

[![NX](https://img.shields.io/badge/NX-22.1.1-blue.svg)](https://nx.dev)
[![NestJS](https://img.shields.io/badge/NestJS-11.1.9-red.svg)](https://nestjs.com)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black.svg)](https://nextjs.org)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

**Aggregate content from multiple sources, analyze with LLMs, and deliver personalized notifications.**

English | [中文](./README_zh.md)

</div>

---

## 🎯 What is ksha?

**ksha** is an intelligent information stream processing engine that helps you quickly discover valuable signals from massive amounts of information.

### Problems Solved

- 📢 **Information Overload** - Key signals are drowned in noise.
- ⏰ **Too Late** - Opportunities missed by the time you see them.
- 📊 **Information Silos** - Unable to see connections between events.
- 📊 **Data Without Insight** - Unsure how to act on data.

### Use Cases

- 🐦 **Social Media Monitoring** - Track industry leaders and trends.
- 📰 **News Aggregation** - Subscribe to multiple blogs and news sources.
- 💹 **Market Data Monitoring** - Real-time tracking of market dynamics.
- 🔗 **Webhook Integration** - Receive pushes from third-party services.

---

## ✨ Core Features

### 📡 Multi-source Data Collection

| Source | Description |
|--------|-------------|
| **X (Twitter)** | Monitor specific accounts using the official API. |
| **RSS** | Subscribe to any RSS/Atom feed. |
| **Bluesky** | Monitor Bluesky accounts using AT Protocol. |
| **Mastodon** | Monitor Mastodon/Fediverse accounts. |
| **Telegram** | Monitor public channels and groups. |
| **Discord** | Monitor Discord server channels. |
| **Reddit** | Monitor Subreddits. |
| **GitHub** | Monitor repository events and releases. |
| **NewsNow** | Integrate with NewsNow trending topics. |
| **WebSocket** | Real-time data stream access. |
| **Webhook** | Receive external push notifications. |

### 🤖 LLM Intelligent Analysis

- **Multi-model Support** - OpenAI / Anthropic / Google Gemini / SiliconFlow / Custom.
- **Trigger Conditions** - Use AI to determine if content meets specific criteria.
- **Content Extraction** - Intelligently extract and summarize key information.
- **Skip LLM** - Support for directly forwarding original content.

### 🔔 Multi-channel Notifications

- **Telegram** - Send to Bot / Channel / Group.
- **Discord** - Webhook notifications.
- **Slack** - Webhook notifications.
- **Email** - SMTP email notifications.
- **Generic Webhook** - Connect to any HTTP service.

> Supports configuring multiple notification channels per Stream, and creating multiple channels of the same type (e.g., multiple Telegram Bots).

### ⚙️ Processing Engine

- **Stream Processing** - High-performance real-time processing.
- **Queue System** - BullMQ asynchronous tasks.
- **Scheduled Digests** - Daily/Weekly reports.
- **Backtesting System** - Historical data analysis.

### 🎛️ Web Management Interface

- **Dashboard** - Data overview and statistics.
- **Source Management** - Add and configure data sources.
- **Stream Management** - Create and manage processing streams.
- **Notification Channels** - Configure multiple notification channels.
- **Settings Center** - Configuration for LLMs, Twitter API, etc.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm 8+
- PostgreSQL 16+
- Redis 7+

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/ksha.git
cd ksha

# Install dependencies
pnpm install

# Configure environment variables
cp .env.example .env
# Edit .env file to configure database, etc.

# Start database
docker compose up -d

# Run database migrations
cd apps/api && npx prisma db push

# Seed database (creates admin user)
npx prisma db seed
# Default credentials: admin@ksha.local / admin

# Start services
cd ../..
pnpm start:all
# Or start individually:
# pnpm nx serve api  - API Service (http://localhost:8002)
# pnpm nx serve web  - Web Interface (http://localhost:3000)
```

### Docker Deployment

```bash
# Start all services
docker compose up -d

# Service Addresses
# API: http://localhost:8002
# Web: http://localhost:3000
```

---

## 🏗️ Project Architecture

```
ksha/
├── apps/
│   ├── api/           # NestJS Backend API
│   │   ├── src/
│   │   │   ├── source/        # Data Source Management
│   │   │   ├── stream/        # Stream Processing Engine
│   │   │   ├── notification/  # Notification Service
│   │   │   ├── llm/           # LLM Integration
│   │   │   ├── queue/         # Queue Service
│   │   │   └── analytics/     # Data Analytics
│   │   └── prisma/            # Database Schema
│   └── web/           # Next.js Frontend
│       ├── app/               # Page Routing
│       ├── components/        # UI Components
│       └── lib/               # Utility Libraries
├── docker-compose.yml # Local Development Environment
└── package.json
```

### Tech Stack

- **Backend**: NestJS + Fastify + Prisma + BullMQ
- **Frontend**: Next.js + React + TailwindCSS
- **Database**: PostgreSQL + Redis
- **Build System**: NX Monorepo

---

## ⚙️ Configuration

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/ksha"
REDIS_HOST="localhost"
REDIS_PORT="6379"

# LLM (Configured in Web Interface)
# - OpenAI API Key
# - Anthropic API Key
# - SiliconFlow API Key
# - Or custom OpenAI compatible interface

# Twitter API (Optional)
# - OAuth 2.0 Client ID/Secret
# - API Key/Secret

# Notification Channels (Configured in Web Interface)
# - Telegram Bot Token + Chat ID
# - Discord Webhook URL
# - Slack Webhook URL
```

---

## 📖 Usage Workflow

1. **Add Data Source** - Add sources to monitor in the Sources page.
2. **Create Stream** - Configure processing rules and LLM parameters.
3. **Setup Notifications** - Add notification channels and associate them with a Stream.
4. **Start Monitoring** - Activate the Stream to start processing.

---

## 🤝 Contribution

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md).

```bash
# Development
pnpm nx serve api
pnpm nx serve web

# Testing
pnpm nx test api

# Build
pnpm nx build api
pnpm nx build web
```

---

## 📄 License

[MIT License](LICENSE)

---

## 🙏 Acknowledgements

- [NestJS](https://nestjs.com) - Backend Framework
- [Next.js](https://nextjs.org) - Frontend Framework
- [NX](https://nx.dev) - Monorepo Management
- [Prisma](https://prisma.io) - Database ORM
- [BullMQ](https://bullmq.io) - Queue System
