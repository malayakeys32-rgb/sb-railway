# Sentinel Black — Deploying to Railway

This repo is a monorepo with two deployable apps:

```
/                → backend (Express + Prisma), config: railway.json
/frontend        → frontend (Next.js), config: frontend/railway.json
```

On Railway you'll create **one project** containing **three services**: Postgres, the backend API, and the frontend.

---

## 1. Create the project

1. Railway dashboard → **New Project** → **Deploy from GitHub repo** (push this folder to a repo first), or **Empty Project** if you'd rather add services manually.
2. **Add a PostgreSQL database**: New → Database → PostgreSQL. Railway provisions it and exposes `DATABASE_URL` automatically to services you link it to.

## 2. Backend service

1. New → GitHub Repo (same repo) → this becomes your backend service.
2. **Settings → Root Directory**: leave as `/` (repo root).
3. Railway auto-detects `railway.json` at the root and uses:
   - Build: `npm install && npx prisma generate && npm run build`
   - Start: `node dist/server.js`
   - Health check: `/health`
4. **Variables** tab — add:

   | Variable            | Value                                                        |
   |----------------------|---------------------------------------------------------------|
   | `DATABASE_URL`       | Reference the Postgres service: `${{Postgres.DATABASE_URL}}` |
   | `JWT_SECRET`         | A strong random 32+ char string                              |
   | `CORS_ORIGIN`        | Your frontend's public URL (set after step 3)                |
   | `UPLOAD_DIR`         | `./uploads`                                                   |
   | `MAX_FILE_SIZE_MB`   | `100`                                                          |

   Do **not** set `PORT` — Railway injects it automatically and `src/config.ts` already reads `process.env.PORT`.

5. **Networking → Generate Domain** to get a public URL for the backend (e.g. `sentinel-black-api-production.up.railway.app`).
6. **Run the first migration** once the service is deployed, using the Railway CLI:
   ```bash
   railway link          # select this project/service
   railway run npx prisma db push
   ```

### Persistent uploads

Railway's filesystem is ephemeral on redeploy. For real evidence-file storage, attach a **Volume** (Settings → Volumes → New Volume, mount path `/app/uploads`) so uploaded files survive deploys/restarts, or point `UPLOAD_DIR` at an external object store instead.

## 3. Frontend service

1. New → GitHub Repo (same repo again) → this becomes the frontend service.
2. **Settings → Root Directory**: `frontend`
3. Railway picks up `frontend/railway.json`:
   - Build: `npm install && npm run build`
   - Start: `npm run start`
4. **Variables** tab — add:

   | Variable       | Value                                                   |
   |----------------|----------------------------------------------------------|
   | `BACKEND_URL`  | The backend's public URL from step 2.5, e.g. `https://sentinel-black-api-production.up.railway.app` |

   (`next.config.mjs` now reads `BACKEND_URL` to proxy `/api-backend/*` to the backend — no code changes needed beyond this env var.)

5. **Networking → Generate Domain** for the frontend.
6. Go back to the **backend** service's `CORS_ORIGIN` variable and set it to this frontend URL, then redeploy the backend.

## 4. Creating the first admin user

Register normally via the deployed frontend, then promote yourself via the Postgres service's **Data** tab or `railway run`:

```bash
railway run psql $DATABASE_URL -c "UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';"
```

---

## Summary of what changed for Railway (vs. the original Render setup)

- Added `railway.json` (backend) and `frontend/railway.json` (frontend) — Railway's per-service build/start/healthcheck config.
- `frontend/package.json`: `dev`/`start` scripts now bind to `$PORT` instead of a hardcoded `5000`, since Railway assigns ports dynamically.
- `frontend/next.config.mjs`: the API proxy rewrite destination is now driven by a `BACKEND_URL` env var instead of a hardcoded `http://localhost:8000`, since backend and frontend run as separate services with separate domains on Railway.
- Pinned `"engines": {"node": "20.x"}` in both `package.json` files so Railway's Nixpacks builder picks a consistent Node version.
- `render.yaml` and `.replit` are left in place but unused by Railway — safe to delete if you no longer need Render/Replit as fallback targets.
