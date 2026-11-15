# Laboratory Management System (LMS)

A production-grade, multi-tenant web Laboratory Management System (LMS) built as a modular monolith featuring a separate Next.js App Router frontend and an Express 5 API backend. Multiple diagnostic laboratories (tenants) securely share a single MongoDB database with strict data isolation enforced at the database and query layers, granular Role-Based Access Control (RBAC), and high-performance server-side data workflows.

## Documentation Index

The specification files located in `/docs` define the contract and architecture for the system:

| File | Purpose |
|---|---|
| [README.md](docs/README.md) | Docs index and reading order |
| [RULES.md](docs/RULES.md) | Architectural and implementation rules |
| [FEATURES.md](docs/FEATURES.md) | Product capabilities, user roles, and acceptance criteria |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, multi-tenancy model, scalability, and roadmap |
| [BACKEND.md](docs/BACKEND.md) | Backend modules, layers, Mongoose schemas, auth, and logging |
| [API_CONTRACT.md](docs/API_CONTRACT.md) | Complete REST API specification (v1) |
| [SECURITY.md](docs/SECURITY.md) | Security defenses and vulnerability prevention checklist |
| [FRONTEND.md](docs/FRONTEND.md) | Next.js architecture, state boundaries, hooks, and routing rules |
| [DESIGN.md](docs/DESIGN.md) | Design tokens, typography, component styling, and palettes |
| [PERFORMANCE.md](docs/PERFORMANCE.md) | Latency budgets, indexing rules, and verification checklist |
| [PROMPTS.md](docs/PROMPTS.md) | Step-by-step implementation playbook |
| [postman/](docs/postman/) | Postman collection and environment for API verification |

## Getting Started (Placeholder)

> *Note: Application code is scaffolded in subsequent phases.*

### Prerequisites
- Node.js (v18+ or v20+ recommended)
- MongoDB running locally on `mongodb://localhost:27017` or MongoDB Atlas
- npm / pnpm / yarn

### Backend Setup
```bash
cd backend
# Instructions will be populated in Phase 1
npm run dev
```

### Frontend Setup
```bash
cd frontend
# Instructions will be populated in Phase 2
npm run dev
```

### Docker (Optional)
```bash
docker compose up --build
```
