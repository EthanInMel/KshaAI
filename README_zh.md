# ksha - 智能信息流处理引擎

<div align="center">

[![NX](https://img.shields.io/badge/NX-22.1.1-blue.svg)](https://nx.dev)
[![NestJS](https://img.shields.io/badge/NestJS-11.1.9-red.svg)](https://nestjs.com)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black.svg)](https://nextjs.org)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

**从多个信息源聚合内容，使用 LLM 智能分析，个性化通知推送**

[English](./README.md) | 中文

</div>

---

## 🎯 什么是 ksha？

**ksha** 是一个智能信息流处理引擎，帮助你从海量信息中快速发现有价值的信号。

### 解决的痛点

- 📢 **信息太多** - 关键信号淹没在噪音中
- ⏰ **发现得太晚** - 等看到时机会已过
- 📊 **信息孤立** - 无法看到事件间的关联
- 📊 **有数据无洞察** - 不知道该怎么行动

### 使用场景

- 🐦 **监控社交账号** - 追踪行业大佬动态
- 📰 **新闻聚合** - 订阅多个博客和新闻源
- 💹 **市场数据监控** - 实时追踪市场动态
- 🔗 **Webhook 集成** - 接收第三方服务推送

---

## ✨ 核心功能

### 📡 多源数据采集

| 数据源 | 说明 |
|--------|------|
| **X (Twitter)** | 监控特定账号动态，使用官方 API |
| **RSS** | 订阅任意 RSS/Atom 源 |
| **Bluesky** | 监控 Bluesky 账号，使用 AT Protocol |
| **Mastodon** | 监控 Mastodon/Fediverse 账号 |
| **Telegram** | 监控公开频道和群组 |
| **Discord** | 监控 Discord 服务器频道 |
| **Reddit** | 监控 Subreddit |
| **GitHub** | 监控仓库事件和 Release |
| **NewsNow** | 接入 NewsNow 热点聚合 |
| **WebSocket** | 实时数据流接入 |
| **Webhook** | 接收外部推送 |

### 🤖 LLM 智能分析

- **多模型支持** - OpenAI / Anthropic / Google Gemini / SiliconFlow / 自定义
- **触发条件** - 使用 AI 判断内容是否满足条件
- **内容提取** - 智能提取和总结关键信息
- **跳过 LLM** - 支持直接转发原始内容

### 🔔 多渠道通知

- **Telegram** - 发送到 Bot / 频道 / 群组
- **Discord** - Webhook 通知
- **Slack** - Webhook 通知
- **Email** - SMTP 邮件通知
- **通用 Webhook** - 可对接任意 HTTP 服务

> 支持为每个 Stream 配置多个通知渠道，可创建多个同类型渠道（如多个 Telegram Bot）

### ⚙️ 处理引擎

- **Stream 流处理** - 高性能实时处理
- **队列系统** - BullMQ 异步任务
- **定时摘要** - 每日/每周报告
- **回测系统** - 历史数据分析

### 🎛️ Web 管理界面

- **仪表盘** - 数据总览和统计
- **数据源管理** - 添加和配置数据源
- **Stream 管理** - 创建和管理处理流
- **通知渠道** - 配置多个通知渠道
- **设置中心** - LLM / Twitter API 等配置

---

## 🚀 快速开始

### 环境要求

- Node.js 20+
- pnpm 8+
- PostgreSQL 16+
- Redis 7+

### 安装

```bash
# 克隆仓库
git clone https://github.com/your-org/ksha.git
cd ksha

# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件配置数据库等

# 启动数据库
docker compose up -d

# 运行数据库迁移
cd apps/api && npx prisma db push

# 启动服务
pnpm start:all
# 或分别启动:
# pnpm nx serve api  - API 服务 (http://localhost:8002)
# pnpm nx serve web  - Web 界面 (http://localhost:3000)
```

### Docker 部署

```bash
# 启动所有服务
docker compose up -d

# 服务地址
# API: http://localhost:8002
# Web: http://localhost:3000
```

---

## 🏗️ 项目架构

```
ksha/
├── apps/
│   ├── api/           # NestJS 后端 API
│   │   ├── src/
│   │   │   ├── source/        # 数据源管理
│   │   │   ├── stream/        # 流处理引擎
│   │   │   ├── notification/  # 通知服务
│   │   │   ├── llm/           # LLM 集成
│   │   │   ├── queue/         # 队列服务
│   │   │   └── analytics/     # 数据分析
│   │   └── prisma/            # 数据库 Schema
│   └── web/           # Next.js 前端
│       ├── app/               # 页面路由
│       ├── components/        # UI 组件
│       └── lib/               # 工具库
├── docker-compose.yml # 本地开发环境
└── package.json
```

### 技术栈

- **后端**: NestJS + Fastify + Prisma + BullMQ
- **前端**: Next.js + React + TailwindCSS
- **数据库**: PostgreSQL + Redis
- **构建**: NX Monorepo

---

## ⚙️ 配置说明

### 环境变量

```bash
# 数据库
DATABASE_URL="postgresql://user:pass@localhost:5432/ksha"
REDIS_HOST="localhost"
REDIS_PORT="6379"

# LLM (在 Web 界面中配置)
# - OpenAI API Key
# - Anthropic API Key
# - SiliconFlow API Key
# - 或自定义 OpenAI 兼容接口

# Twitter API (可选)
# - OAuth 2.0 Client ID/Secret
# - API Key/Secret

# 通知渠道 (在 Web 界面中配置)
# - Telegram Bot Token + Chat ID
# - Discord Webhook URL
# - Slack Webhook URL
```

---

## 📖 使用流程

1. **添加数据源** - 在 Sources 页面添加要监控的数据源
2. **创建 Stream** - 配置处理规则和 LLM 参数
3. **设置通知** - 添加通知渠道并关联到 Stream
4. **启动监控** - 激活 Stream 开始处理

---

## 🤝 贡献

欢迎贡献代码！请查看 [CONTRIBUTING.md](CONTRIBUTING.md)

```bash
# 开发
pnpm nx serve api
pnpm nx serve web

# 测试
pnpm nx test api

# 构建
pnpm nx build api
pnpm nx build web
```

---

## 📄 许可证

[MIT License](LICENSE)

---

## 🙏 致谢

- [NestJS](https://nestjs.com) - 后端框架
- [Next.js](https://nextjs.org) - 前端框架
- [NX](https://nx.dev) - Monorepo 管理
- [Prisma](https://prisma.io) - 数据库 ORM
- [BullMQ](https://bullmq.io) - 队列系统
