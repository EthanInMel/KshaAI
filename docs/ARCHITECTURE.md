# ksha Architecture Documentation

## 1. High-Level Overview

**ksha** (Knowledge Stream Handler & Agent) is an intelligent information processing engine designed to aggregate, filter, analyze, and deliver critical insights from various data sources.

The system operates as a data pipeline:
`Source (Raw Data) -> Ingestion -> Processing (Stream + LLM) -> Notification`

```mermaid
graph TD
    Sources[Sources (Twitter, RSS, etc.)] -->|Pull/Push| Ingestion[Ingestion Layer]
    Ingestion -->|Raw Content| Queue[Task Queue (BullMQ)]
    Queue -->|Process Job| StreamEngine[Stream Engine]
    StreamEngine -->|Context| LLM[LLM Service]
    LLM -->|Insight| StreamEngine
    StreamEngine -->|Notification| Notifier[Notification Service]
    Notifier -->|Alert| User[User (Telegram, Discord, etc.)]
```

## 2. Technology Stack

*   **Monorepo Management**: [Nx](https://nx.dev)
*   **Backend**: NestJS, TypeScript
    *   **Database**: PostgreSQL (via Prisma ORM)
    *   **Queue**: Redis (via BullMQ)
    *   **LLM Integration**: OpenAI SDK (compatible with DeepSeek, OpenAI, etc.)
*   **Frontend**: Next.js (React), TailwindCSS, Shadcn/UI
*   **Package Manager**: pnpm

## 3. Project Structure

The project currently adopts a **Modular Monolith** architecture within an Nx workspace.

### `apps/`
*   **`api`**: The centralized backend service. Responsible for orchestration, API endpoints, and worker consumers.
    *   **Core Business Modules**:
        *   `Source`: Manages data intake adapters (Twitter, RSS, etc.).
        *   `Stream`: Orchestrates data flow, rules, and prompt templates.
        *   `Llm`: Handles interactions with Large Language Models.
        *   `Notification`: Dispatches alerts to downstream channels (Telegram, Webhooks).
        *   `Backtest`: Runs historical data simulations to validate prompt/stream strategies.
        *   `Analytics`: System-wide metrics and reporting dashboard data.
    *   **Infrastructure Modules**:
        *   `Prisma`: Database connection and repository abstraction.
        *   `Queue`: Asynchronous job processing (BullMQ) configuration.
        *   `Auth`: Authentication (JWT, API Keys) and authorization.
        *   `Events`: Internal event bus for decoupled inter-module communication.
        *   `Polling` / `Webhook`: Specific mechanisms for data ingestion.
        *   `Health`: System health checks.
        *   `Log`: Centralized logging and auditing.
*   **`web`**: The user interface dashboard.
    *   Built with Next.js and TailwindCSS.
    *   Provides management for configurations (Sources, Streams).
    *   Visualizes real-time Logs, Backtest results, and Analytics.

### `libs/`
*   **`shared`**: Utilities, constants, and type definitions shared between `api` and `web`.

## 4. Core Workflow

1.  **Ingestion**:
    *   **PollingService**: Actively fetches data from APIs (e.g., RSS, Twitter) at scheduled intervals.
    *   **WebhookService**: Listens for passive data reception from external webhooks.
2.  **Queuing**:
    *   Raw content is immediately pushed to the Redis-backed `Queue`. This ensures high availability and handles traffic bursts without blocking the API.
3.  **Processing**:
    *   Worker processes consume jobs from the queue.
    *   Data is matched against active **Streams**.
    *   **LlmService** constructs a prompt using the Stream's template and the raw content, then queries the LLM.
4.  **Decision & Action**:
    *   The LLM reasoning determines if the content is "Signal" (valuable) or "Noise".
    *   If identified as a Signal, the **NotificationService** routes the formatted message to configured channels.
    *   **LogService** records every step of this lifecycle for auditing and debugging.
