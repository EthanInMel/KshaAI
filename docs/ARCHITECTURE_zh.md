# ksha 架构文档

## 1. 概览 (High-Level Overview)

**ksha** (Knowledge Stream Handler & Agent) 是一个智能信息流处理引擎，旨在聚合多源信息，通过 LLM（大语言模型）进行过滤、分析与结构化，并向用户精准交付关键洞察。

系统核心链路如下：
`数据源 (Source) -> 摄入 (Ingestion) -> 处理 (Stream + LLM) -> 通知 (Notification)`

```mermaid
graph TD
    Sources[数据源 (Twitter, RSS, etc.)] -->|拉取/推送| Ingestion[摄入层]
    Ingestion -->|原始内容| Queue[任务队列 (BullMQ)]
    Queue -->|处理任务| StreamEngine[流引擎]
    StreamEngine -->|上下文| LLM[LLM 服务]
    LLM -->|洞察结果| StreamEngine
    StreamEngine -->|推送| Notifier[通知服务]
    Notifier -->|提醒| User[用户 (Telegram, Discord, etc.)]
```

## 2. 技术栈 (Technology Stack)

*   **Monorepo 管理**: [Nx](https://nx.dev)
*   **后端**: NestJS, TypeScript
    *   **数据库**: PostgreSQL (via Prisma ORM)
    *   **消息队列**: Redis (via BullMQ)
    *   **LLM 集成**: OpenAI SDK (兼容 DeepSeek, OpenAI, Anthropic 等)
*   **前端**: Next.js (React), TailwindCSS, Shadcn/UI
*   **包管理**: pnpm

## 3. 项目结构 (Project Structure)

本项目采用 Nx 工作区下的 **模块化单体 (Modular Monolith)** 架构。

### `apps/`
*   **`api`**: 核心后端服务。负责业务编排、API 接口暴露以及队列消费者运行。
    *   **核心业务模块**:
        *   `Source`: 管理各类数据源适配器 (Twitter, RSS 等)。
        *   `Stream`: 定义数据流向、处理规则及 Prompt 模板。
        *   `Llm`: 封装与大模型的交互逻辑。
        *   `Notification`: 负责向第三方渠道 (Telegram, Webhooks) 分发消息。
        *   `Backtest`: 回测模块，利用历史数据验证策略与 Prompt 的有效性。
        *   `Analytics`: 统计与分析模块，提供系统运行指标。
    *   **基础设施模块**:
        *   `Prisma`: 数据库连接与 ORM 封装。
        *   `Queue`: 基于 BullMQ 的异步任务队列配置。
        *   `Auth`: 认证 (JWT/API Keys) 与鉴权。
        *   `Events`: 基于 EventEmitter 的内部事件总线。
        *   `Polling` / `Webhook`: 具体的数据摄入机制实现。
        *   `Health`: 系统健康检查。
        *   `Log`: 集中式日志记录与审计。
*   **`web`**: 管理后台用户界面。
    *   基于 Next.js 与 TailwindCSS 构建。
    *   提供数据源、流规则的配置管理界面。
    *   实时展示系统日志 (Logs)、回测结果及分析报表。

### `libs/`
*   **`shared`**: 存放前后端 (`api` 与 `web`) 共享的工具函数、常量及 TypeScript 类型定义。

## 4. 核心工作流 (Core Workflow)

1.  **数据摄入 (Ingestion)**:
    *   **PollingService**: 定时轮询外部 API (如 RSS, Twitter) 获取最新数据。
    *   **WebhookService**: 被动接收外部系统的 Webhook 推送。
2.  **异步队列 (Queuing)**:
    *   获取的原始内容会被立即推入 Redis 队列。这保证了系统的高可用性，并能有效应对突发流量，避免阻塞 API 主线程。
3.  **智能处理 (Processing)**:
    *   Worker 进程从队列中消费任务。
    *   数据根据规则匹配到对应的 **Stream (流)**。
    *   **LlmService** 结合流配置的 Prompt 模板与原始内容，向 LLM 发起请求进行分析。
4.  **决策与触达 (Decision & Action)**:
    *   LLM 根据推理结果判断内容是 "信号 (Signal)" 还是 "噪音 (Noise)"。
    *   若判定为有效信号，**NotificationService** 将根据配置格式化消息并发送至指定渠道。
    *   **LogService** 会记录全链路的处理日志，便于后续审计与调试。
