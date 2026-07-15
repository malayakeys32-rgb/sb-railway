# Sentinel Black

A forensic-grade evidence vault and incident documentation platform with chain-of-custody tracking, timeline management, and pattern analysis.

## Run & Operate

- **Frontend**: `cd frontend && npm run dev` → port 5000
- **Backend**: `npm run dev` (root) → port 8000
- **DB migrate**: `npx prisma db push` (root)
- **Prisma generate**: `npx prisma generate` (root)

Required env vars: `DATABASE_URL` (Replit managed), `JWT_SECRET`, `PORT=8000`, `CORS_ORIGIN=*`, `NEXT_PUBLIC_API_BASE=/api-backend`

## Stack

- **Frontend**: Next.js 14.2, React 18, TypeScript, Axios, Zustand
- **Backend**: Express 4, TypeScript, ts-node-dev, Prisma 5, bcryptjs, jsonwebtoken, multer, sharp
- **Database**: PostgreSQL (Replit managed)
- **Runtime**: Node.js 20

## Where things live

- `src/` — Express backend (routes, middleware, services)
- `prisma/schema.prisma` — Database schema (source of truth)
- `frontend/app/` — Next.js app router pages
- `frontend/app/api/client.ts` — Axios client, Zustand auth store, all API helpers
- `frontend/app/components/Sidebar.tsx` — Main nav sidebar
- `frontend/public/` — Static assets (logos)

## Architecture decisions

- **Frontend proxies backend**: Next.js rewrites `/api-backend/*` → `http://localhost:8000/*` so the browser never needs direct access to port 8000. `NEXT_PUBLIC_API_BASE=/api-backend` drives this.
- **Prisma on root**: Backend and prisma schema live at repo root; frontend is in `frontend/` subdirectory.
- **JWT auth**: Stateless JWT tokens (7-day expiry) stored in Zustand with `zustand/middleware` persist (localStorage).
- **Evidence chain-of-custody**: Stored as JSON array on each Evidence record; files stored in `./uploads/` served statically.
- **Forensic hashing**: Evidence files are hashed on upload; timeline events get forensic hashes and are locked by default.

## Product

- User registration/login with role-based access (ADMIN, REPORTER, VIEWER)
- Incident management with severity, status, category, location tracking
- Evidence vault with file upload, SHA hash verification, chain-of-custody log
- Timeline events per incident (locked, forensically hashed)
- Pattern detection linking multiple incidents
- Secure sharing links for evidence with expiry and view limits
- Audit log of all user actions
- Masked mode for anonymous operations

## User preferences

- Dark tactical UI (black/red theme, Inter font)
- Sentinel Black logo displayed on login and sidebar

## Gotchas

- Backend must be running before frontend makes API calls
- `NEXT_PUBLIC_API_BASE` is a build-time var — restart frontend after changing it
- Prisma client must be regenerated after schema changes (`npx prisma generate`)
- Port 4000 is not available in Replit; backend uses port 8000

## Pointers

- Prisma schema: `prisma/schema.prisma`
- API client + types: `frontend/app/api/client.ts`
- DB skill: `.local/skills/database/SKILL.md`
