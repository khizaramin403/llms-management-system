# Antigravity Prompt Playbook

Thirty-seven prompts, in order. Paste one prompt at a time, review the result, run it, commit, then continue.

## 1. How to Use
1. Put the docs folder in the project root as /docs and open the project folder as the workspace in Antigravity.
2. Run one prompt per task. Check the changes and run the dev server or tests before continuing. Make a git commit after every prompt (for example "P10 auth module").
3. If your version has Planning and Fast modes, use Planning for large prompts (P08 to P16 and P24 to P33) and Fast for small ones.
4. Start a new conversation at the beginning of each phase to keep the context small. Every prompt names the documents to read, so nothing is lost.
5. If the agent drifts from the documents, reply: "Re-read docs/RULES.md and the files named in the prompt, then fix your output to match them."
6. Optional: if your Antigravity version supports workspace rules, copy docs/RULES.md into that rules location so it is always loaded. Check your version for the exact folder.

## 2. Phases

| Phase | Prompts | Result |
|---|---|---|
| 0 Setup | P01 to P02 | Docs read, repository skeleton |
| 1 Backend | P03 to P18 | Complete API with tests |
| STOP | Postman checkpoint | You test every API in Postman |
| 2 Frontend foundation | P19 to P26 | Tokens, theme, shared components |
| 3 Auth and shell | P27 to P28 | Login, route guard, sidebar layout |
| 4 Features | P29 to P33 | Dashboard, labs, users, patients |
| 5 Quality and delivery | P34 to P37 | Performance, design audit, Docker, final review |

## Phase 0: Setup

## P01: Read the documents (no code)
Files the agent reads: every file in /docs.
```prompt
You are going to build a multi-tenant Laboratory Management System with me. Read every file in /docs: README.md, RULES.md, FEATURES.md, ARCHITECTURE.md, BACKEND.md, API_CONTRACT.md, SECURITY.md, FRONTEND.md, DESIGN.md, PERFORMANCE.md and PROMPTS.md. Do not write any code yet.
Reply with: (1) a 10 line summary of the system, (2) the build phases you understand, (3) any conflicts, gaps or questions you found in the documents. Wait for my confirmation before doing anything else.
```

## P02: Repository skeleton
Files the agent reads: docs/RULES.md, docs/ARCHITECTURE.md section 2.
```prompt
Read docs/RULES.md and docs/ARCHITECTURE.md (section 2).
In the project root create the folders frontend and backend (empty), keep /docs as it is, and create: README.md (project name, one paragraph description, a table of the docs, and placeholder run instructions), .gitignore (node_modules, dist, .next, .env, .env.local, coverage, logs, OS files), .editorconfig (UTF-8, LF, 2 spaces). Run git init and make the first commit "chore: repository skeleton".
Do not create any application code.
```

## Phase 1: Backend

## P03: Backend scaffold and tooling
Files the agent reads: docs/RULES.md, docs/BACKEND.md (sections 1, 3, 11), docs/ARCHITECTURE.md (section 3).
```prompt
Read docs/RULES.md, docs/BACKEND.md (sections 1, 3 and 11) and docs/ARCHITECTURE.md (section 3).
Inside /backend create a strict TypeScript Node project. Create: package.json (scripts: dev using tsx watch, build, start, lint, test, seed), tsconfig.json (strict, ES2022, outDir dist), eslint.config.mjs, .prettierrc, .gitignore, .env.example (every variable from BACKEND.md section 3 with safe example values), vitest.config.ts.
Install dependencies: express@5, mongoose, zod, jsonwebtoken, bcryptjs, cookie-parser, cors, helmet, compression, express-rate-limit, pino, pino-http, @sentry/node, dotenv. Dev dependencies: typescript, tsx, vitest, supertest, mongodb-memory-server, pino-pretty, eslint, typescript-eslint, prettier and all needed @types packages.
Create the empty folder tree from BACKEND.md section 1 with a .gitkeep in every empty folder.
Acceptance: npm run build and npm run lint pass. No application code yet.
```

## P04: Config and logging
Files the agent reads: docs/RULES.md, docs/BACKEND.md (sections 3, 9), docs/PERFORMANCE.md (section 2).
```prompt
Read docs/RULES.md, docs/BACKEND.md (sections 3 and 9) and docs/PERFORMANCE.md (section 2).
Create in /backend/src/config:
1. env.ts: load dotenv, validate every variable with zod (coercing numbers), export a typed frozen env object, and exit with a clear message when validation fails.
2. logger.ts: a pino logger with the redaction rules from BACKEND.md section 9, pino-pretty only when NODE_ENV is development, level from LOG_LEVEL.
3. db.ts: connectDB and disconnectDB using mongoose with maxPoolSize 20, serverSelectionTimeoutMS 5000, autoIndex only outside production, and connection event logging through the logger.
4. sentry.ts: initSentry that does nothing when SENTRY_DSN is empty and exports captureException helper.
Acceptance: typecheck and lint pass. A small script or test shows that missing env values produce a clear error.
```

## P05: Constants, context, utils, types
Files the agent reads: docs/RULES.md, docs/BACKEND.md (sections 2, 5, 6, 7, 8), docs/FEATURES.md (section 2), docs/SECURITY.md.
```prompt
Read docs/RULES.md, docs/BACKEND.md (sections 2, 5, 6, 7 and 8), docs/FEATURES.md (section 2) and docs/SECURITY.md.
Create in /backend/src:
- constants/roles.ts: ROLES as const object, Role type, helper isRole.
- constants/permissions.ts: PERMISSIONS map (tenant:manage, user:manage, patient:create, patient:read, patient:update, patient:delete, dashboard:read) matching the permission matrix in FEATURES.md, and a hasPermission(role, permission) function.
- context/tenantContext.ts: AsyncLocalStorage with a TenantContext type { tenantId: string | null; userId: string; role: Role; isSuperAdmin: boolean } and helpers runWithTenant and getTenantContext.
- utils/ApiError.ts: class with statusCode, message, errors, and static helpers badRequest, unauthorized, forbidden, notFound, conflict, tooMany.
- utils/apiResponse.ts: sendOk, sendCreated, sendPaginated following the envelope in BACKEND.md section 7.
- utils/paginate.ts: as described in BACKEND.md section 8 (parallel find and count, lean, limit cap 100, escaped anchored prefix search helper).
- utils/cookies.ts: setAuthCookies and clearAuthCookies for lms_access, lms_refresh and lms_session exactly as BACKEND.md section 6.
- utils/tokens.ts: signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken, hashToken (sha256).
- types/express.d.ts: augment Request with user and validated.
Acceptance: typecheck passes. Add small Vitest unit tests for paginate helpers (search escaping, limit cap) and hasPermission.
```

## P06: Middlewares
Files the agent reads: docs/RULES.md, docs/BACKEND.md (sections 2, 7, 9), docs/SECURITY.md.
```prompt
Read docs/RULES.md, docs/BACKEND.md (sections 2, 7 and 9) and docs/SECURITY.md.
Create in /backend/src/middlewares:
- requestId.ts: reuse X-Request-Id or generate a UUID, set it on the response header and on req.id.
- sanitize.ts: remove keys that start with $ or contain a dot from req.body and req.params (recursive). Do not assign to req.query because it is read-only in Express 5.
- validate.ts: validate({ body, query, params }) using zod schemas, store the parsed result in req.validated, and return a 400 with the field errors format from BACKEND.md.
- rateLimiter.ts: apiLimiter (300 per 15 minutes per IP) and loginLimiter (5 per 15 minutes per IP and email) using express-rate-limit, returning the standard error envelope with 429.
- notFound.ts: 404 for unknown routes.
- errorHandler.ts: central handler that maps ApiError, ZodError, Mongoose validation and cast errors, and duplicate key errors (409), logs with the logger, reports 5xx to Sentry, includes requestId, and hides stack traces in production.
Acceptance: typecheck and lint pass; unit tests for sanitize and errorHandler mappings.
```

## P07: App, server and health route
Files the agent reads: docs/RULES.md, docs/BACKEND.md (sections 1, 2), docs/PERFORMANCE.md (section 3), docs/SECURITY.md.
```prompt
Read docs/RULES.md, docs/BACKEND.md (sections 1 and 2), docs/PERFORMANCE.md (section 3) and docs/SECURITY.md.
Create:
- src/routes/index.ts: an Express router mounted at /api/v1 with a GET /health route returning { status: "ok", uptime, db } using the mongoose connection state.
- src/app.ts: createApp() with, in this order: requestId, pino-http, helmet, cors (origin CLIENT_ORIGIN, credentials true), compression, express.json with a 100kb limit, cookie-parser, sanitize, apiLimiter, routes, notFound, errorHandler. Trust proxy setting from env when in production.
- src/server.ts: init Sentry, connect to MongoDB, start the HTTP server, and implement graceful shutdown on SIGTERM and SIGINT (stop accepting, close the server, disconnect MongoDB, exit). Handle unhandledRejection and uncaughtException by logging and shutting down.
Acceptance: npm run dev starts, GET /api/v1/health returns 200, unknown route returns the 404 envelope.
```

## P08: Tenant plugin and base models
Files the agent reads: docs/RULES.md, docs/BACKEND.md (sections 4, 5), docs/ARCHITECTURE.md (section 4), docs/PERFORMANCE.md (section 2).
```prompt
Read docs/RULES.md, docs/BACKEND.md (sections 4 and 5), docs/ARCHITECTURE.md (section 4) and docs/PERFORMANCE.md (section 2).
Create:
- plugins/tenant.plugin.ts: adds a required indexed tenantId field, query hooks for find, findOne, countDocuments, updateOne, updateMany, findOneAndUpdate, deleteOne and an aggregate hook that prepends a $match, applying the tenant filter from tenantContext unless the context is missing or the user is a super admin; and a pre save hook that sets tenantId on new documents. For User, tenantId must be allowed to be null (super admin), so make the plugin configurable with an option allowNull.
- modules/tenants/tenant.model.ts (Tenant, with unique slug and status).
- modules/users/user.model.ts (User with all fields and indexes from BACKEND.md section 4, passwordHash select false, email lowercase and unique, tenant plugin with allowNull).
- modules/auth/refreshToken.model.ts (with TTL index on expiresAt).
Acceptance: write Vitest tests with mongodb-memory-server proving the plugin filters by tenant, does not filter for a super admin, and does not filter when there is no context.
```

## P09: Authentication and authorization middleware
Files the agent reads: docs/RULES.md, docs/BACKEND.md (sections 5, 6), docs/SECURITY.md, docs/API_CONTRACT.md (Cookies).
```prompt
Read docs/RULES.md, docs/BACKEND.md (sections 5 and 6), docs/SECURITY.md and docs/API_CONTRACT.md.
Create in src/middlewares:
- authenticate.ts: read the lms_access cookie, verify it, load the active user and its tenant status (reject inactive users and inactive labs with 403), set req.user = { id, role, tenantId, isSuperAdmin } and call next inside runWithTenant so the whole request runs in the tenant context. Missing or invalid token returns 401.
- authorize.ts: authorize(permission) that checks hasPermission and returns 403 with a clear message.
Acceptance: Vitest tests with a tiny test router covering no cookie (401), expired token (401), wrong role (403), and correct role (200).
```

## P10: Auth module
Files the agent reads: docs/RULES.md, docs/BACKEND.md (sections 2, 6, 7), docs/API_CONTRACT.md (Auth), docs/SECURITY.md.
```prompt
Read docs/RULES.md, docs/BACKEND.md (sections 2, 6 and 7), docs/API_CONTRACT.md (Auth section) and docs/SECURITY.md.
Create in src/modules/auth: auth.validation.ts (zod for login), auth.service.ts (login, refresh with rotation and reuse detection, logout, getMe), auth.controller.ts (thin), auth.routes.ts (POST /login with loginLimiter and validate, POST /refresh, POST /logout, GET /me with authenticate). Mount at /api/v1/auth in routes/index.ts.
Follow exactly: generic invalid credentials message, 403 for inactive user or lab, cookies from utils/cookies.ts, hashed refresh tokens stored in the database, lastLoginAt update.
Acceptance: Supertest tests for login success, wrong password, inactive user, refresh rotation, reuse of an old refresh token, logout, and /me.
```

## P11: Seed script
Files the agent reads: docs/RULES.md, docs/BACKEND.md (sections 3, 11), docs/FEATURES.md.
```prompt
Read docs/RULES.md, docs/BACKEND.md (sections 3 and 11) and docs/FEATURES.md.
Create src/scripts/seed.ts and wire npm run seed. It must be idempotent. It creates the Super Admin from SEED_SUPER_ADMIN_EMAIL and SEED_SUPER_ADMIN_PASSWORD. When NODE_ENV is development it also creates one demo lab "Demo Diagnostics" with a Lab Admin, a Doctor and a Receptionist (password printed once in the console), and 50 demo patients with realistic names, phones and dates of birth spread over the last 10 days. Because the patient module is not built yet, write the patient seeding so it is skipped with a log message if the Patient model does not exist yet; we will re-run it after P14.
Acceptance: npm run seed runs twice without duplicates.
```

## P12: Tenants module
Files the agent reads: docs/RULES.md, docs/BACKEND.md, docs/API_CONTRACT.md (Tenants), docs/FEATURES.md (section 5), docs/SECURITY.md.
```prompt
Read docs/RULES.md, docs/BACKEND.md, docs/API_CONTRACT.md (Tenants section), docs/FEATURES.md (section 5) and docs/SECURITY.md.
Create in src/modules/tenants: tenant.validation.ts, tenant.service.ts, tenant.controller.ts, tenant.routes.ts, all protected by authenticate and authorize("tenant:manage"). Endpoints exactly as in API_CONTRACT.md. Creating a tenant also creates its Lab Admin (bcryptjs with BCRYPT_ROUNDS). Do not use database transactions (standalone MongoDB does not support them): if creating the admin fails, delete the tenant just created and return the error. Generate a unique slug from the name. The list includes userCount using one aggregation, supports search by name (anchored prefix), status filter and sort, and uses paginate().
Acceptance: Supertest tests for each endpoint, 403 for non super admins, 409 for duplicate admin email.
```

## P13: Users module
Files the agent reads: docs/RULES.md, docs/BACKEND.md, docs/API_CONTRACT.md (Users), docs/FEATURES.md (section 5), docs/SECURITY.md.
```prompt
Read docs/RULES.md, docs/BACKEND.md, docs/API_CONTRACT.md (Users section), docs/FEATURES.md (section 5) and docs/SECURITY.md.
Create in src/modules/users: user.validation.ts, user.service.ts, user.controller.ts, user.routes.ts protected by authenticate and authorize("user:manage"). Endpoints exactly as in API_CONTRACT.md. Rules: a Lab Admin can create only DOCTOR or RECEPTIONIST, always inside its own tenant (tenantId taken from req.user, never from the body); a Super Admin may create LAB_ADMIN users and must send tenantId; a Lab Admin can never assign SUPER_ADMIN or LAB_ADMIN; nobody can deactivate themselves or change their own role; email unique (409). The list supports search (name or email prefix), role and isActive filters, sort, pagination, and includes tenantName for Super Admin through a lean populate or aggregation.
Acceptance: Supertest tests including tenant isolation (a Lab Admin of lab A gets 404 for a user of lab B) and every rule above.
```

## P14: Patients module
Files the agent reads: docs/RULES.md, docs/BACKEND.md (sections 4, 5, 8), docs/API_CONTRACT.md (Patients), docs/FEATURES.md (section 6), docs/PERFORMANCE.md (section 2).
```prompt
Read docs/RULES.md, docs/BACKEND.md (sections 4, 5 and 8), docs/API_CONTRACT.md (Patients section), docs/FEATURES.md (section 6) and docs/PERFORMANCE.md (section 2).
Create in src/modules/patients: counter.model.ts, patient.model.ts (indexes from BACKEND.md section 4, tenant plugin), patient.validation.ts (rules from API_CONTRACT.md), patient.service.ts, patient.controller.ts, patient.routes.ts with the per-route permissions. patientCode is PT- plus a zero padded 4 digit sequence per tenant generated with an atomic findOneAndUpdate and $inc on the Counter. Search matches name or phone by anchored escaped prefix. DELETE is a soft delete (isActive false) and lists only return isActive true. Set createdBy and updatedBy.
Then update the seed script so the 50 demo patients are created, and run it.
Acceptance: Supertest tests for RBAC per role, tenant isolation, pagination meta, search, sorting, soft delete, and 20 concurrent creations producing 20 unique codes.
```

## P15: Dashboard module
Files the agent reads: docs/RULES.md, docs/BACKEND.md, docs/API_CONTRACT.md (Dashboard), docs/FEATURES.md (section 7), docs/PERFORMANCE.md (sections 2, 3).
```prompt
Read docs/RULES.md, docs/BACKEND.md, docs/API_CONTRACT.md (Dashboard section), docs/FEATURES.md (section 7) and docs/PERFORMANCE.md (sections 2 and 3).
Create src/modules/dashboard: dashboard.service.ts, dashboard.controller.ts, dashboard.routes.ts with GET /stats protected by authenticate and authorize("dashboard:read"). Return the exact role-specific shapes in API_CONTRACT.md. Run the independent counts and aggregations in parallel with Promise.all, always $match on tenantId first, fill missing days (always 7 entries) and months (6 entries) in code, and set Cache-Control private max-age 30.
Acceptance: Supertest tests for each role shape, zero-filled days, and tenant isolation of the counts.
```

## P16: Backend test suite and coverage gaps
Files the agent reads: docs/RULES.md, docs/BACKEND.md (section 10), docs/SECURITY.md.
```prompt
Read docs/RULES.md, docs/BACKEND.md (section 10) and docs/SECURITY.md.
Review all tests in /backend/tests and fill gaps so these files exist and pass: auth.test.ts, rbac.test.ts (every route group for every role, expected 200 or 403), tenantIsolation.test.ts (Lab A cannot read, list, edit or delete anything of Lab B across users, patients and dashboard counts), patients.test.ts, plus validation and sanitize tests (an operator injection payload such as { "email": { "$ne": null } } must return 400). Use mongodb-memory-server and shared test helpers in tests/helpers.
Acceptance: npm test passes and prints a coverage summary. List any untested risk you see.
```

## P17: Backend Dockerfile (optional)
Files the agent reads: docs/RULES.md, docs/ARCHITECTURE.md (section 7 Docker answer), docs/PERFORMANCE.md (section 3).
```prompt
Read docs/RULES.md, docs/ARCHITECTURE.md (section 7) and docs/PERFORMANCE.md (section 3).
Create backend/Dockerfile (multi-stage: build with devDependencies, final stage with production dependencies only, non-root user, node dist/server.js, HEALTHCHECK calling /api/v1/health) and backend/.dockerignore. Create the root docker-compose.yml with services mongo (with a named volume) and api (build ./backend, env from backend/.env, depends on mongo). The web service will be added later.
Acceptance: docker compose up --build starts the API and /api/v1/health returns 200.
```

## P18: Backend audit against the documents
Files the agent reads: docs/RULES.md, docs/BACKEND.md, docs/API_CONTRACT.md, docs/SECURITY.md, docs/PERFORMANCE.md.
```prompt
Read docs/RULES.md, docs/BACKEND.md, docs/API_CONTRACT.md, docs/SECURITY.md and docs/PERFORMANCE.md.
Audit the whole /backend against these documents and produce a checklist table: requirement, status (done or missing), file. Cover every endpoint and response shape in API_CONTRACT.md, every row of SECURITY.md, the layer rules, index coverage (run explain on the patient list and search queries) and the performance rules. Fix every missing or wrong item, then re-run lint, typecheck and all tests. Finish with the updated checklist.
```

## STOP: Postman Checkpoint (before any frontend work)
When P18 is done, tell Claude "backend is ready for Postman" and Claude will walk you through the test run. Until then, use this checklist.
1. Start MongoDB and the API (npm run dev) and run npm run seed.
2. In Postman import docs/postman/LMS.postman_collection.json and docs/postman/LMS.postman_environment.json, select the LMS Local environment, and set the seeded emails and passwords in the environment variables.
3. Postman keeps cookies automatically, so log in once per role (use the Auth folder requests) before calling protected routes.
4. Run in this order and check the expected status codes:

| Step | Request | Expected |
|---|---|---|
| 1 | GET /health | 200 |
| 2 | POST /auth/login with wrong password | 401 |
| 3 | POST /auth/login as Super Admin | 200 and 3 cookies |
| 4 | GET /auth/me | 200 and role SUPER_ADMIN |
| 5 | POST /tenants (new lab and its admin) | 201 |
| 6 | GET /tenants?page=1&limit=5&search=dem | 200 with meta |
| 7 | POST /auth/logout then GET /auth/me | 200 then 401 |
| 8 | Login as Lab Admin, POST /users (Doctor) | 201 |
| 9 | Lab Admin POST /users with role LAB_ADMIN | 403 or 400 |
| 10 | Lab Admin POST /tenants | 403 |
| 11 | Login as Receptionist, POST /patients | 201 with patientCode |
| 12 | Receptionist DELETE /patients/:id | 403 |
| 13 | Login as Doctor, GET /patients | 200 |
| 14 | Doctor POST /patients | 403 |
| 15 | GET /patients?search=ali&sort=-createdAt&limit=5 | 200, 5 or fewer rows, meta correct |
| 16 | GET /patients?limit=1000 | limit capped at 100 |
| 17 | Login as a second lab's user and GET /patients/:id of lab 1 | 404 |
| 18 | POST /auth/login with email { "$ne": null } | 400 |
| 19 | GET /dashboard/stats for each role | role-specific shape |
| 20 | Wait 15 minutes or delete lms_access, call GET /auth/me, then POST /auth/refresh | 401 then 200 |

5. Fix any failing item with the agent before starting Phase 2. The frontend must never be built against an API that has not passed this list.

## Phase 2: Frontend Foundation

## P19: Create the Next.js app and install dependencies
Files the agent reads: docs/RULES.md, docs/FRONTEND.md (sections 1, 8, 9), docs/ARCHITECTURE.md (section 3).
```prompt
Read docs/RULES.md, docs/FRONTEND.md (sections 1, 8 and 9) and docs/ARCHITECTURE.md (section 3).
Inside /frontend create a Next.js app (latest stable, App Router, TypeScript, Tailwind CSS, ESLint, src directory, import alias @/*). Initialize shadcn/ui with CSS variables enabled. Install: @tanstack/react-query, @tanstack/react-table, zustand, nuqs, react-hook-form, zod, @hookform/resolvers, next-themes, lucide-react, sonner, date-fns, and @tanstack/react-query-devtools as a dev dependency (recharts comes with the shadcn chart component later).
Create the empty folder tree from FRONTEND.md section 1 with .gitkeep files, .env.local.example (BACKEND_URL and NEXT_PUBLIC_API_BASE) and a prettier config.
Acceptance: npm run dev starts and npm run build passes.
```

## P20: Design tokens, fonts and theme
Files the agent reads: docs/RULES.md, docs/DESIGN.md (sections 1, 2, 3, 4), docs/FRONTEND.md (section 4).
```prompt
Read docs/RULES.md and docs/DESIGN.md (sections 1 to 4).
1. In src/app/globals.css define the shadcn CSS variables for four blocks exactly with the hex values from the token table in DESIGN.md section 2: :root[data-palette="navy"], :root[data-palette="navy"].dark, :root[data-palette="cream"], :root[data-palette="cream"].dark. Map them to the Tailwind theme (including chart-1 to chart-5, sidebar tokens, and add success, warning and brand tokens as usable Tailwind colors). Set base radius 0.5rem. Set the body text size to 14px, antialiased, and add the tabular-nums utility usage note as a comment.
2. In src/app/layout.tsx load Inter and JetBrains Mono with next/font (CSS variables --font-sans and --font-mono), set html lang, suppressHydrationWarning, and default data-palette="navy". Add a tiny inline script or cookie read so the saved palette is applied before paint with no flash.
3. Create src/providers/theme-provider.tsx using next-themes (attribute class, defaultTheme system, disableTransitionOnChange) and src/lib/palette.ts with getPalette, setPalette and a type Palette = "navy" | "cream" persisted in localStorage.
Acceptance: temporarily render a color swatch page to confirm all four combinations look correct, then remove it. Typecheck and build pass.
```

## P21: Install shadcn components
Files the agent reads: docs/RULES.md, docs/FRONTEND.md (section 8), docs/DESIGN.md (sections 6, 7).
```prompt
Read docs/RULES.md, docs/FRONTEND.md (section 8) and docs/DESIGN.md (sections 6 and 7).
Using the shadcn CLI add these components: button, input, label, form, card, table, badge, skeleton, sonner, dialog, alert-dialog, sheet, select, tabs, tooltip, separator, breadcrumb, dropdown-menu, avatar, sidebar, chart, empty, alert, scroll-area, collapsible, switch, spinner, pagination. If a name does not exist in the installed version, use the closest equivalent and tell me. Add the Sonner Toaster to the root layout using position bottom-right, with the card, border and foreground tokens for its styling. Tune the default styles in components/ui only through tokens, not hard-coded colors: buttons h-9, inputs h-9, cards rounded-xl with a border and no shadow, dialogs max-w-lg.
Acceptance: build passes; no component uses a hard-coded hex color.
```

## P22: Core library, types, constants, API rewrites
Files the agent reads: docs/RULES.md, docs/FRONTEND.md (sections 1, 2, 3, 5, 6), docs/API_CONTRACT.md, docs/PERFORMANCE.md (section 4).
```prompt
Read docs/RULES.md, docs/FRONTEND.md (sections 1, 2, 3, 5 and 6), docs/API_CONTRACT.md and docs/PERFORMANCE.md (section 4).
Create:
- next.config.ts: rewrites /api/v1/:path* to ${BACKEND_URL}/api/v1/:path*.
- src/types/api.ts (ApiSuccess, ApiErrorBody, Paginated, PaginationMeta) and src/types/user.ts (Role, AuthUser).
- src/lib/api-client.ts: the single fetch wrapper from FRONTEND.md section 2 (credentials include, envelope unwrapping, typed ApiError class, single-flight refresh on 401 then one retry, redirect to /login with a toast when refresh fails). Export get, post, patch, del helpers and a buildQuery helper that drops empty params.
- src/lib/query-client.ts: QueryClient with the defaults from PERFORMANCE.md section 4 and a MutationCache onError that shows a Sonner error toast with the server message (skip when meta.silent is true).
- src/lib/query-keys.ts: key factories for auth, dashboard, labs, users, patients (all, list(params), detail(id)).
- src/lib/utils.ts (cn) and src/lib/format.ts (formatDate, formatDateTime, formatRelative with date-fns, getInitials, formatNumber).
- src/constants/roles.ts, permissions.ts (mirror the backend permission map and a can(role, permission) helper) and navigation.ts (items per role from FEATURES.md section 9 with lucide icons and hrefs).
Acceptance: typecheck passes. Add unit tests for can() and getInitials if a test runner is configured; otherwise skip tests.
```

## P23: Stores, providers and generic hooks
Files the agent reads: docs/RULES.md, docs/FRONTEND.md (sections 3, 4), docs/PERFORMANCE.md (section 5).
```prompt
Read docs/RULES.md, docs/FRONTEND.md (sections 3 and 4) and docs/PERFORMANCE.md (section 5).
Create:
- src/stores/auth.store.ts: Zustand store with user, status ("idle" | "loading" | "authenticated" | "unauthenticated"), setUser, setStatus, clear. Not persisted. Export small selector hooks (useUserRole, useCurrentUser, useAuthStatus) so components subscribe narrowly.
- src/providers/query-provider.tsx: client component that creates the QueryClient once (useState initializer) and renders React Query Devtools only in development.
- src/hooks/use-debounced-value.ts and src/hooks/use-mounted.ts.
Wire NuqsAdapter (nuqs/adapters/next/app), QueryProvider and ThemeProvider into the root layout in a stable order. Provider values must not change between renders.
Acceptance: typecheck passes; add a short comment in each file explaining the re-render reasoning.
```

## P24: Shared components A (identity and feedback)
Files the agent reads: docs/RULES.md, docs/DESIGN.md (sections 6, 7), docs/FRONTEND.md (section 5).
```prompt
Read docs/RULES.md, docs/DESIGN.md (sections 6 and 7) and docs/FRONTEND.md (section 5).
Create in src/components/shared:
- UserAvatar.tsx: shadcn Avatar with AvatarImage and AvatarFallback showing initials; the fallback color comes from a fixed set of muted token-based tints chosen by a hash of the name; props name, src, size ("sm" 28, "md" 32, "lg" 40).
- StatusBadge.tsx (active or inactive, subtle style with dot) and RoleBadge.tsx (one subtle tint per role).
- EmptyState.tsx: wraps the shadcn Empty component with props icon, title, description, action, size ("sm" for charts, "md" for tables) and variant ("no-data" or "no-results").
- PageHeader.tsx: title, description, actions slot, optional breadcrumb slot.
Build a temporary preview route that shows all of them in light and dark and both palettes, check it, then delete the route.
Acceptance: components use only tokens, are accessible (aria labels), and are server components unless they need client features.
```

## P25: Shared components B (table system)
Files the agent reads: docs/RULES.md, docs/DESIGN.md (section 6), docs/FRONTEND.md (sections 3, 4, 5), docs/PERFORMANCE.md (sections 4, 5).
```prompt
Read docs/RULES.md, docs/DESIGN.md (section 6), docs/FRONTEND.md (sections 3, 4 and 5) and docs/PERFORMANCE.md (sections 4 and 5).
Create in src/components/shared:
- DataTable.tsx: generic component built on TanStack Table and the shadcn Table with manualPagination and manualSorting. Props: columns, data, isLoading, isFetching, isError, onRetry, emptyState (node), sorting, onSortingChange. Shows TableSkeleton on first load, keeps rows at 60 percent opacity with a small spinner while isFetching, shows the Empty state when there is no data, and an Alert with Retry on error. Sticky header, 44px rows, hover tint, bordered rounded-xl container.
- DataTablePagination.tsx: "Showing X to Y of Z", Previous and Next, rows per page select (10, 20, 50), page and limit controlled by props.
- TableSkeleton.tsx: configurable rows and columns.
- SearchInput.tsx: icon input with its own useState text, 300 ms debounce through use-debounced-value, calls onSearch(value), a clear button, and a small spinner when isFetching.
- A hook src/hooks/use-table-params.ts that uses nuqs to read and write page, limit, search, sort (and extra filter keys) in the URL and resets page to 1 when search or filters change.
Acceptance: typing in SearchInput must not re-render the table container; confirm with the React Profiler and note the result.
```

## P26: Shared components C (cards, charts, dialogs, guards)
Files the agent reads: docs/RULES.md, docs/DESIGN.md (sections 6, 7, 8), docs/FRONTEND.md (sections 4, 5, 6).
```prompt
Read docs/RULES.md, docs/DESIGN.md (sections 6, 7 and 8) and docs/FRONTEND.md (sections 4, 5 and 6).
Create in src/components/shared:
- StatCard.tsx (label, value with tabular-nums, optional hint, icon in a muted rounded square) and StatCardSkeleton.tsx.
- ChartCard.tsx: Card with title, description, optional period label, content slot, fixed height, and built-in states: isLoading shows a Skeleton, isEmpty shows EmptyState size "sm", isError shows an Alert with Retry.
- ConfirmDialog.tsx: shadcn AlertDialog with title, description, confirmLabel, destructive option, isPending spinner on the confirm button.
- RoleGuard.tsx: takes allowedRoles or a permission, reads the role with a narrow selector, and renders children or an "Access denied" EmptyState.
Acceptance: all components use tokens only, memoize where it is useful (StatCard, ChartCard), and have no data fetching inside.
```

## Phase 3: Auth and Shell

## P27: Authentication integration
Files the agent reads: docs/RULES.md, docs/API_CONTRACT.md (Auth, Cookies), docs/FRONTEND.md (sections 2, 5, 6, 7), docs/DESIGN.md (sections 6, 7).
```prompt
Read docs/RULES.md, docs/API_CONTRACT.md (Auth and Cookies sections), docs/FRONTEND.md (sections 2, 5, 6 and 7) and docs/DESIGN.md (sections 6 and 7).
The backend is running and tested. Create:
- src/features/auth/api.ts (login, logout, me), hooks.ts (useLogin, useLogout, useMe with TanStack Query; useLogin and useLogout are mutations), schemas.ts (zod login schema), components/LoginForm.tsx (react-hook-form and shadcn Form, email and password with show or hide password, button spinner while pending, inline server error), components/AuthGate.tsx (client component: calls me, fills the auth store, shows a layout-sized skeleton while loading, redirects to /login when unauthenticated).
- src/app/(auth)/login/page.tsx: a minimal, centered card on a subtle background with the logo mark, title, short description and the form. After login redirect to /dashboard and show a success toast.
- src/proxy.ts (use middleware.ts if the installed Next.js version still uses that name): redirect to /login when the lms_session cookie is missing on dashboard routes, and away from /login to /dashboard when it exists. Do not verify tokens here.
- On logout clear the auth store and the query cache.
Acceptance: log in with each seeded role, refresh the page (session survives), log out, and confirm protected pages redirect. Delete only the lms_access cookie in the browser and confirm the next request refreshes silently.
```

## P28: App shell (sidebar, header, layout)
Files the agent reads: docs/RULES.md, docs/DESIGN.md (sections 5, 6, 7, 9), docs/FRONTEND.md (sections 1, 4, 5, 6), docs/FEATURES.md (section 9).
```prompt
Read docs/RULES.md, docs/DESIGN.md (sections 5, 6, 7 and 9), docs/FRONTEND.md (sections 1, 4, 5 and 6) and docs/FEATURES.md (section 9).
Create in src/components/layout and the dashboard route group:
- AppSidebar.tsx using the shadcn Sidebar with collapsible="icon": 256px expanded, 56px collapsed with tooltips, logo mark and lab name at the top, navigation built from constants/navigation.ts filtered by the role (read through a narrow selector), active item with the sidebar-accent background and a 2px brand indicator, NavUser in the footer. Becomes a Sheet drawer on mobile. State persists through the shadcn sidebar cookie. Ctrl or Cmd + B toggles it.
- NavUser.tsx: UserAvatar (shadcn Avatar), name, RoleBadge, and a DropdownMenu with Theme (Light, Dark, System), Palette (Navy, Cream) and Log out.
- AppHeader.tsx: 56px sticky header with SidebarTrigger, Breadcrumbs.tsx (derived from the pathname), a spacer, ThemeToggle.tsx and the avatar dropdown.
- src/app/(dashboard)/layout.tsx: SidebarProvider, AppSidebar, SidebarInset, AppHeader, AuthGate and a main area with page padding and max width 1280.
- loading.tsx (skeleton page), error.tsx (Alert style with Try again), not-found.tsx.
- Placeholder pages with only a PageHeader for dashboard, labs, users, staff and patients; each page wrapped in RoleGuard with the right roles.
Acceptance: sidebar collapses and expands smoothly, persists after reload, mobile drawer works, each role sees only its own items, theme and palette switching work, and the sidebar and header do not re-render when a page changes (verify with the Profiler).
```

## Phase 4: Features

## P29: Dashboard feature
Files the agent reads: docs/RULES.md, docs/API_CONTRACT.md (Dashboard), docs/FEATURES.md (section 7), docs/DESIGN.md (sections 6, 7, 8), docs/PERFORMANCE.md (sections 4, 5).
```prompt
Read docs/RULES.md, docs/API_CONTRACT.md (Dashboard section), docs/FEATURES.md (section 7), docs/DESIGN.md (sections 6, 7 and 8) and docs/PERFORMANCE.md (sections 4 and 5).
Create in src/features/dashboard: types.ts (types for every role shape), api.ts, hooks.ts (useDashboardStats with staleTime 60 seconds), and components: RegistrationsBarChart.tsx (shadcn Chart bar chart, 7 days, rounded bars, no vertical grid, tooltip), BreakdownBars.tsx (horizontal bars with label, bar and value, used for gender and for users by role), SuperAdminCharts.tsx (labs per month bar chart and users by role bars), RecentPatientsTable.tsx (avatar, name, patient code in mono font, relative time, uses the shared table styles and EmptyState).
Build src/app/(dashboard)/dashboard/page.tsx: renders the stat cards, then the chart row (two thirds and one third), then the recent patients table, according to the role. Load chart components with next/dynamic and skeleton fallbacks. Every section has skeleton, empty and error states.
Acceptance: all four roles show the correct cards and charts; empty data shows the empty state; no layout shift when data arrives.
```

## P30: Labs feature (Super Admin)
Files the agent reads: docs/RULES.md, docs/API_CONTRACT.md (Tenants), docs/FEATURES.md (section 5), docs/FRONTEND.md (sections 2, 3, 4, 5, 7), docs/DESIGN.md (section 6).
```prompt
Read docs/RULES.md, docs/API_CONTRACT.md (Tenants section), docs/FEATURES.md (section 5), docs/FRONTEND.md (sections 2, 3, 4, 5 and 7) and docs/DESIGN.md (section 6).
Create in src/features/labs: types.ts, api.ts, hooks.ts (useLabs with keepPreviousData, useCreateLab, useUpdateLab; mutations invalidate only the labs keys), schemas.ts (zod create and edit schemas that match the API rules), components/LabColumns.tsx (defined outside any component; columns: name with avatar-style initials, contact email, phone, user count, status badge, created date, actions menu), components/LabsTable.tsx, components/LabFormDialog.tsx (create includes the Lab Admin fields; edit does not; inline field errors; server 409 maps to the email field).
Build src/app/(dashboard)/labs/page.tsx: PageHeader with an "Add lab" button, SearchInput, status Select filter, DataTable with pagination, all state in the URL through use-table-params. Activate or deactivate through ConfirmDialog. Success toasts. Empty states for no data and no results.
Acceptance: pagination, search, filter and sort work through the URL; no flicker between pages; page reload keeps the state.
```

## P31: Users and Staff features
Files the agent reads: docs/RULES.md, docs/API_CONTRACT.md (Users), docs/FEATURES.md (section 5), docs/FRONTEND.md (sections 3, 4, 5, 7), docs/DESIGN.md (section 6).
```prompt
Read docs/RULES.md, docs/API_CONTRACT.md (Users section), docs/FEATURES.md (section 5), docs/FRONTEND.md (sections 3, 4, 5 and 7) and docs/DESIGN.md (section 6).
Create in src/features/users: types.ts, api.ts, hooks.ts (useUsers, useCreateUser, useUpdateUser), schemas.ts, components/UserColumns.tsx (avatar plus name and email, role badge, lab name column only for Super Admin, status badge, created date, actions), components/UsersTable.tsx (prop scope: "all" for Super Admin or "lab" for Lab Admin, shared by both pages), components/UserFormDialog.tsx (create and edit; Lab Admin sees only Doctor and Receptionist roles; Super Admin sees a lab Select loaded with useLabs and can pick Lab Admin; edit allows name, role, active status and optional password reset).
Build pages src/app/(dashboard)/users/page.tsx (Super Admin, with lab filter and role filter) and src/app/(dashboard)/staff/page.tsx (Lab Admin, with role filter). Same patterns as Labs: URL state, search, pagination, toasts, empty states, ConfirmDialog for deactivate. A user cannot deactivate themselves (hide the action).
Acceptance: each role sees only what the API allows; forms show the exact validation messages; no duplicated table code between the two pages.
```

## P32: Patients list, create and edit
Files the agent reads: docs/RULES.md, docs/API_CONTRACT.md (Patients), docs/FEATURES.md (section 6), docs/FRONTEND.md (sections 3, 4, 5, 7), docs/DESIGN.md (section 6), docs/PERFORMANCE.md (sections 4, 5).
```prompt
Read docs/RULES.md, docs/API_CONTRACT.md (Patients section), docs/FEATURES.md (section 6), docs/FRONTEND.md (sections 3, 4, 5 and 7), docs/DESIGN.md (section 6) and docs/PERFORMANCE.md (sections 4 and 5).
Create in src/features/patients: types.ts, api.ts, hooks.ts (usePatients with keepPreviousData and next-page prefetch, usePatient, useCreatePatient, useUpdatePatient, useDeactivatePatient), schemas.ts (zod rules identical to API_CONTRACT.md validation), components/PatientColumns.tsx (outside any component: avatar plus name, code in mono font, phone, gender badge, age from date of birth, registered date, actions menu), components/PatientsTable.tsx, components/PatientFormDialog.tsx (create and edit, two-column grid on desktop, date of birth picker input, inline errors).
Build src/app/(dashboard)/patients/page.tsx: PageHeader with "Register patient" (only when can(role, "patient:create")), SearchInput (name or phone), gender filter, sort, DataTable with pagination, all in the URL. Row actions are filtered by role (view for all, edit for Lab Admin and Receptionist, deactivate for Lab Admin only). Toasts and empty states ("No patients yet" with a register button for allowed roles; "No results" with a Clear search button).
Acceptance: Doctor sees no create, edit or deactivate controls; typing in search sends one request after 300 ms; changing a page re-renders only the table body (Profiler); deactivating removes the row after the list refreshes.
```

## P33: Patient details
Files the agent reads: docs/RULES.md, docs/API_CONTRACT.md (Patients), docs/FEATURES.md (section 6), docs/DESIGN.md (sections 6, 7), docs/FRONTEND.md (section 5).
```prompt
Read docs/RULES.md, docs/API_CONTRACT.md (Patients section), docs/FEATURES.md (section 6), docs/DESIGN.md (sections 6 and 7) and docs/FRONTEND.md (section 5).
Create src/features/patients/components/PatientDetails.tsx and src/app/(dashboard)/patients/[id]/page.tsx. Layout: breadcrumb (Patients, patient code), a header card with a large UserAvatar, name, patient code in mono font, status badge and action buttons (Edit through the existing PatientFormDialog, Deactivate through ConfirmDialog, both role-aware), and an information card with a two-column grid (phone, gender, date of birth and age, address, registered by, registered date). Use usePatient with a skeleton fallback; a 404 from the API shows an EmptyState ("Patient not found") with a back button; other errors show an Alert with Retry. After deactivation toast and navigate back to the list.
Acceptance: opening another lab's patient id shows the not found state; Doctor sees no action buttons.
```

## Phase 5: Quality and Delivery

## P34: Performance audit and fixes
Files the agent reads: docs/RULES.md, docs/PERFORMANCE.md, docs/FRONTEND.md (section 4).
```prompt
Read docs/RULES.md, docs/PERFORMANCE.md and docs/FRONTEND.md (section 4).
Audit the frontend and backend against PERFORMANCE.md and produce a table of findings (item, status, evidence). Specifically: use the React Profiler to verify that typing in search does not re-render the sidebar, header or stat cards, and that changing pages re-renders only the table body; check every Zustand selector is narrow; check that column definitions and callbacks are stable; confirm charts and dialogs are dynamically imported; run the bundle analyzer and report the largest chunks; run Lighthouse on /dashboard and /patients; seed 100,000 patients into one tenant (add a seed option for this) and measure list and search latency, running explain on the queries. Fix every issue that breaks a budget and re-measure.
Finish with a before and after summary.
```

## P35: Design, UX and accessibility audit
Files the agent reads: docs/RULES.md, docs/DESIGN.md, docs/FRONTEND.md (section 5), docs/FEATURES.md (section 8).
```prompt
Read docs/RULES.md, docs/DESIGN.md, docs/FRONTEND.md (section 5) and docs/FEATURES.md (section 8).
Audit every page in light and dark mode and in both palettes (navy and cream), on desktop and mobile widths. Check: no hard-coded colors, spacing on the 4px grid, typography sizes and weights as specified, compact and minimal look (nothing bulky), sidebar collapse and mobile drawer, avatars everywhere a person appears, loading skeletons match final layouts, every table and chart has an empty state, toasts for every mutation, inline form errors, focus rings, aria-labels on icon buttons, keyboard navigation, color contrast of text. Produce a checklist table and fix every failure, then summarize.
```

## P36: Frontend Docker, compose and README (optional)
Files the agent reads: docs/RULES.md, docs/ARCHITECTURE.md (section 7), docs/FRONTEND.md (section 9).
```prompt
Read docs/RULES.md, docs/ARCHITECTURE.md (section 7) and docs/FRONTEND.md (section 9).
Create frontend/Dockerfile (multi-stage, Next.js standalone output, non-root user) and frontend/.dockerignore, enable output "standalone" in next.config.ts, and extend the root docker-compose.yml with a web service that depends on api and receives BACKEND_URL=http://api:5000. Write the final root README.md: overview, screenshots placeholders, architecture diagram in Mermaid, how to run with and without Docker, environment variables, seed users, test commands, folder structure, and a short "design decisions" section (why Zustand, TanStack Query, tenant plugin, why Redis, microservices and ABAC are deferred).
Acceptance: docker compose up --build runs MongoDB, API and web, and the login flow works.
```

## P37: Final review against all documents
Files the agent reads: every file in /docs.
```prompt
Read every file in /docs. Do a final review of the whole project against FEATURES.md, ARCHITECTURE.md, BACKEND.md, API_CONTRACT.md, SECURITY.md, FRONTEND.md, DESIGN.md and PERFORMANCE.md. Produce one table with every requirement, its status and the file that implements it. Fix everything missing, run lint, typecheck, tests and a production build for both apps, and run through the demo script: Super Admin creates a lab, Lab Admin creates a Doctor and Receptionist, Receptionist registers patients, Doctor views patients, the second lab cannot see the first lab data. Give me the final checklist and a short demo script I can use with my manager.
```

## Appendix: What to Tell Claude at Each Stage
- After P18, say "backend is ready for Postman" to get the guided API test walkthrough.
- If any prompt result looks wrong, paste the agent's output or error to Claude and ask for a corrected prompt.
- To add a new feature later, ask Claude for a new module prompt that follows the same pattern (API contract first, backend, Postman, then frontend).
