# Sentinel Black — Deployment Guide

## Quick Deploy to Render

### One-click Blueprint
Use `render.yaml` at the repo root. In Render:
1. New → Blueprint Instance → connect your repo
2. Render auto-creates both services + the PostgreSQL database
3. After first deploy, copy the frontend URL into the `CORS_ORIGIN` env var of the API service and redeploy the API

---

## Manual Setup (Any Platform)

### Backend

| Setting       | Value                                    |
|---------------|------------------------------------------|
| Root Dir      | `/` (repo root)                          |
| Build Command | `npm install && npx prisma generate && npm run build` |
| Start Command | `node dist/server.js`                    |
| Port          | `8000`                                   |
| Health Check  | `GET /health`                            |

**Required environment variables:**

| Variable         | Notes                                              |
|------------------|----------------------------------------------------|
| `DATABASE_URL`   | PostgreSQL connection string                       |
| `JWT_SECRET`     | Strong random string (32+ chars). **Required.**    |
| `PORT`           | `8000`                                             |
| `CORS_ORIGIN`    | Frontend origin URL e.g. `https://yourapp.com`     |
| `UPLOAD_DIR`     | `./uploads` (or a cloud bucket path)               |
| `MAX_FILE_SIZE_MB` | `100`                                            |

**Run DB migrations after first deploy:**
```bash
npx prisma db push
```

---

### Frontend

| Setting       | Value                                     |
|---------------|-------------------------------------------|
| Root Dir      | `frontend/`                               |
| Build Command | `npm install && npm run build`            |
| Start Command | `npm run start`                           |
| Port          | `5000`                                    |

**Required environment variables (build-time):**

| Variable                | Notes                                               |
|-------------------------|-----------------------------------------------------|
| `NEXT_PUBLIC_API_BASE`  | `/api-backend` (uses Next.js rewrites proxy)        |

> **Proxy note:** `next.config.mjs` rewrites `/api-backend/*` → `http://localhost:8000/*`.
> On a single-server deploy both processes run on the same host so this works transparently.
> On separate services, replace the rewrite destination with the full backend URL.

---

## Environment Variable Checklist

```
# Backend
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=<32+ char random string>
PORT=8000
CORS_ORIGIN=https://your-frontend-url.com
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=100

# Frontend (build-time)
NEXT_PUBLIC_API_BASE=/api-backend
```

---

## Creating the First Admin User

After deploying, register normally via the UI then run this SQL to promote to ADMIN:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';
```

---

## Docker (optional)

The project does not include a Dockerfile. If containerising:
- Use `node:20-alpine` base
- Build backend first, then frontend
- Run both processes in a single container with a process manager (e.g. `pm2`) or use separate containers
