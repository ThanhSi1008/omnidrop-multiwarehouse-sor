# Omnidrop Multiwarehouse Smart Order Routing (SOR)

A high-performance, multi-warehouse smart order routing system designed for high-concurrency Flash Sale campaigns. The project is developed using a microservices architecture within a **NestJS Workspaces (Strict TypeScript)** monorepo, combining synchronous gRPC calls with asynchronous RabbitMQ event processing.

---

## 🏗️ System Architecture & Microservices

The system consists of 4 main microservices working in coordination:

1. **`api-gateway` (Port `3000`)**: The single entry point for clients. Integrates a Keep-Alive Connection Agent to optimize socket reuse and minimize TCP handshake overhead under heavy load.
2. **`flash-sale-service` (Port `3002`)**: Handles flash sale purchase requests via **Atomic Redis Lua Scripts** to prevent overselling, generate hold/reservation tokens, and enforce user purchase limits.
3. **`order-routing-service` (Port `3003`)**: Consumes `order.created` events via RabbitMQ and computes the **Smart Order Routing (SOR)** algorithm based on customer location to distribute orders to warehouses or split orders across locations.
4. **`core-service` (Port `3001` / gRPC `50052`)**: Manages core entities (products, variants, warehouses, physical inventories). Provides a gRPC Server to query Available-to-Sell (ATS) stock with ultra-low latency (< 10ms).

### 📊 Business Flow Diagram (Saga Choreography)

```
[Customer] ──(POST /purchase)──> [api-gateway]
                                        │
                                        ▼ (Proxy)
                             [flash-sale-service] (Redis Lua Script)
                                        │
                                        ▼ (Emit: order.created)
                                   [RabbitMQ]
                                        │
                                        ▼ (Consume)
                             [order-routing-service] (SOR Algorithm)
                                 ├── Call gRPC ──> [core-service] (Get ATS stock)
                                 └── Save PostgreSQL (Schema: order)
                                        │
                      ┌─────────────────┴─────────────────┐
                      ▼ (Payment Success)                 ▼ (Payment Timeout > 5 min)
             [POST /orders/:id/pay]             [check-timeouts-trigger (cron)]
                      │                                   │
                      ▼ (Emit: order.paid)                ▼ (Emit: order.timeout)
                 [RabbitMQ]                          [RabbitMQ]
                      │                                   │
                      ▼ (Consume)                         ▼ (Consume)
               [core-service]                      [flash-sale-service]
           (Deduct physical stock)              (Restore Redis stock & limits)
```

---

## 🛠️ Port Allocations

### Infrastructure Services (Docker Compose)
* **PostgreSQL**: `5432` (Uses a single physical database `omnidrop_db` split into logical schemas `core` and `order`).
* **Redis**: `6380` (Host port mapped from container `6379` to avoid host clashes).
* **RabbitMQ**: `5673` (AMQP host port) and `15673` (Management Dashboard).
* **Jaeger Tracing**: `16686` (Query UI).

### Local Services
* **api-gateway**: `3000`
* **core-service**: `3001` (HTTP) / `50052` (gRPC Server)
* **flash-sale-service**: `3002` (HTTP)
* **order-routing-service**: `3003` (HTTP)

---

## 🚀 Installation & Quick Start

### 1. Start Infrastructure
Requires Docker and Docker Compose installed on your machine.
```bash
docker compose up -d
```

### 2. Install Dependencies & Build
Install workspaces dependencies and compile TypeScript codebase:
```bash
npm install
npm run build
```

### 3. Run Microservices
Open 4 terminal tabs or launch the services in the background using npm workspaces:
```bash
npm run start -w apps/api-gateway
npm run start -w apps/core-service
npm run start -w apps/flash-sale-service
npm run start -w apps/order-routing-service
```

---

## 🧪 Seeding & E2E Verification Scripts

The [scripts/](file:///Users/xis108/Desktop/omnidrop-multiwarehouse-sor/scripts) directory contains automated helper scripts for local development:

1. **Seed Database & Redis State**:
   ```bash
   node scripts/seed.js
   ```
   This script purges old records, registers warehouses (`KHO_HN`, `KHO_HCM`), creates 5 physical stock items in each warehouse, and configures 3 initial campaign stock items for SKU `KINH-X-DEN-SIZE-M` in Redis.

2. **Run E2E Integration Flow Verification**:
   ```bash
   node scripts/verify_flow.js
   ```
   This script automates the verification of:
   - User 1 (Hanoi) purchases &rarr; Redis stock drops to 2 &rarr; SOR routes fulfillment to `KHO_HN`.
   - Simulated payment success &rarr; Saga `order.paid` consumes event and deducts 1 physical stock from PostgreSQL `KHO_HN` table.
   - User 2 purchases &rarr; Order created as `PENDING_PAYMENT` &rarr; Simulated timeout &rarr; Saga `order.timeout` consumes event, cancels order, restores Redis stock, and clears user purchase limits.
