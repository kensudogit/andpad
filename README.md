# ANDPAD — Go / GraphQL Edition

> **GraphQL-first SaaS Architecture** — A reference implementation combining a Go API, a shared GraphQL schema, a Next.js frontend, PostgreSQL persistence, real-time subscriptions, and an AI-assisted KPI board.
>
> **Stack:** Go · gqlgen · chi · GraphQL · PostgreSQL · JWT · Next.js 15 · React 19 · TypeScript · Apollo Client · Docker · OpenAI

## Architecture

```text
graphql/schema.graphql
        │
        ├── backend/   Go + gqlgen + chi
        │              GraphQL API / GraphiQL / Subscription
        │
        └── frontend/  Next.js 15 + React 19
                       GraphQL Codegen + Apollo Client
```

The GraphQL SDL in `graphql/schema.graphql` is the single source of truth shared by the API and frontend.

## Highlights

| Area | Implementation |
|---|---|
| API | Go, gqlgen, chi and GraphQL |
| Web | Next.js 15, React 19 and TypeScript |
| Data | PostgreSQL |
| Authentication | JWT-based authentication |
| Type safety | GraphQL Codegen / Typed Document Node |
| Real-time | GraphQL Subscription |
| AI | KPI-oriented AI Board using OpenAI |
| Infrastructure | Docker Compose and Railway deployment |

## Quick Start with Docker

### Requirements

- Node.js 20+
- Go 1.22+
- Docker / Docker Compose

```powershell
cd C:\devlop\andpad
copy .env.example .env
# Set OPENAI_API_KEY in .env when using AI Board features.

npm run docker:up
```

| Service | URL |
|---|---|
| Web UI | http://localhost:3000 |
| Status | http://localhost:3000/status |
| GraphQL API | http://localhost:8080/graphql |
| GraphiQL | http://localhost:8080/graphiql |

Stop the Docker environment with:

```powershell
npm run docker:down
```

## Local Development

```powershell
cd C:\devlop\andpad
npm run install:all
cd backend
go mod tidy
cd ..
npm run dev
```

When `DATABASE_URL` is configured, the application uses PostgreSQL-backed SaaS persistence.

## GraphQL Development Workflow

1. Update `graphql/schema.graphql`.
2. Regenerate the Go GraphQL implementation with gqlgen.
3. Add or update frontend operations under `frontend/src/graphql/`.
4. Run GraphQL Codegen for frontend types.

```powershell
cd backend
go generate ./...

cd ..\frontend
npm run codegen
```

## AI Board

The AI Board combines operational KPIs with AI-assisted analysis. Configure `OPENAI_API_KEY` to enable AI features.

## Deployment

Railway deployment documentation is available in `docs/RAILWAY.md`.

Typical production configuration includes:

| Variable | Purpose |
|---|---|
| `PORT` | Go API port |
| `DATABASE_URL` | PostgreSQL connection |
| `JWT_SECRET` | Authentication signing secret |
| `OPENAI_API_KEY` | AI Board features |
| `API_URL` | Next.js-to-API connection |

## Architecture Variants

This repository is the **Go / GraphQL baseline** of a multi-language architecture series:

| Repository | Backend / specialization |
|---|---|
| [andpad](https://github.com/kensudogit/andpad) | Go + gqlgen baseline |
| [andpad_j](https://github.com/kensudogit/andpad_j) | Java 21 + Spring Boot + Spring GraphQL |
| [andpad_kot](https://github.com/kensudogit/andpad_kot) | Kotlin + Spring Boot + GraphQL |
| [andpad_mart](https://github.com/kensudogit/andpad_mart) | Java + Spring Boot + intra-mart integration |

The series demonstrates how the same GraphQL-oriented application architecture can be migrated across backend technologies while retaining a shared frontend and API contract.

## Engineering Focus

- GraphQL schema as a single source of truth
- Strong frontend/backend type integration
- Multi-language backend migration
- Real-time GraphQL communication
- SaaS-oriented authentication and persistence
- AI-assisted operational dashboards
- Containerized development and cloud deployment
