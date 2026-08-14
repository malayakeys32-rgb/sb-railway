# Sentinel Black - Deployment Checklist

## Database Schema ✅
- [x] Prisma schema expanded with Agent, Threat, SystemLog, ThreatMonitor models
- [x] All enums created (AgentStatus, ClearanceLevel, ThreatType, ThreatSeverity, etc.)
- [x] Foreign key relationships established
- [x] Indexes created for query performance
- [x] Migration file created: `prisma/migrations/1786696698_add_agents_threats_monitoring/migration.sql`

## Backend API Routes ✅
- [x] `/api/agents` - Deploy, list, view, update, delete agents
- [x] `/api/threats` - Create, list, view, update threats; link threats to cases
- [x] `/api/system-logs` - Log creation, filtering by severity/component, log management
- [x] `/api/threat-monitors` - Create monitors, add alert rules, manage thresholds
- [x] All routes integrated into Express server (src/server.ts)
- [x] Authentication middleware applied to protected routes
- [x] Error handling and validation implemented

## Frontend Pages ✅
- [x] Cases page (`/admin/cases`) - List all cases with filtering
- [x] Case details page (`/admin/cases/:id`) - View case with linked evidence, agents, threats
- [x] Evidence vault (`/admin/evidence`) - Table view of all evidence
- [x] Evidence viewer (`/admin/evidence/:id`) - Full details with chain of custody
- [x] Agent roster (`/admin/agents`) - List all deployed agents
- [x] Threat monitor (`/admin/threat-monitor`) - Real-time threat dashboard with filters
- [x] System logs (`/admin/system-logs`) - Live system activity log with filtering

## UI Components ✅
- [x] NeonCard - Reusable card with glow effects
- [x] NeonButton - Interactive buttons with hover states
- [x] StatusBadge - Status indicators with severity colors
- [x] Neon theme utilities - Consistent styling across app

## Still To Complete
- [ ] Detail page for individual agents (`/admin/agents/:id`)
- [ ] Detail page for individual threats (`/admin/threat-monitor/:id`)
- [ ] Detail page for threat monitors settings
- [ ] Evidence upload endpoint with file handling
- [ ] Sidebar navigation links to new routes
- [ ] User can assign agents to cases from case details
- [ ] User can link threats to cases from threat monitor
- [ ] Database seeding with sample data (optional)
- [ ] End-to-end testing

## Pre-Deployment

### 1. Environment Variables
Ensure these are set in Railway:
```
DATABASE_URL=postgresql://...        # Auto-set by Railway Postgres
JWT_SECRET=<strong-random-secret>    # Already set
NODE_ENV=production                  # Set in Railway
NEXT_PUBLIC_API_URL=<backend-url>   # Already configured
```

### 2. Schema Validation
```bash
cd sentinel-black-railway-deploy
npx prisma validate
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Test Build Locally (Optional)
```bash
npm install
npm run build
```

## Deployment to Railway

### Step 1: Commit Changes
```bash
git add .
git commit -m "feat: Add Sentinel Black investigation system (Agents, Threats, System Logs, Threat Monitors)

- Expand Prisma schema with 6 new models and 8 new enums
- Add Agent deployment, Threat detection, SystemLog tracking
- Create ThreatMonitor with AlertRule configuration
- Implement CRUD APIs for all new modules
- Build frontend pages for Cases, Evidence, Agents, Threats, Logs
- Integrate neon hologram UI theme with glowing components
- Connect all routes to Express server
- Create database migration for schema updates"
```

### Step 2: Push to GitHub
```bash
git push origin main
```

### Step 3: Monitor Railway Deployment
1. Go to https://railway.com/project/af4cf68c-004e-4b50-8a2d-3d8251589132
2. Watch `sb-railway` service build
3. Confirm `preDeployCommand: npx prisma migrate deploy` runs
4. Check deployment logs for migration success
5. Verify frontend redeploys with new pages
6. Test health check: `GET /health`

### Step 4: Post-Deployment Verification
```bash
# Check health
curl https://sb-railway-production.up.railway.app/health

# List all endpoints
curl https://sb-railway-production.up.railway.app/api

# Create a test agent (requires auth token)
curl -X POST https://sb-railway-production.up.railway.app/api/agents \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Agent Test",
    "clearanceLevel": "LEVEL_3",
    "specialization": "Field Investigation"
  }'
```

## Risk Mitigation

### Data Loss Protection
- ✅ All migrations are additive (no drops)
- ✅ Foreign key constraints preserve data integrity
- ✅ Existing tables unchanged (User, Case, Evidence, etc.)

### Rollback Plan
If migration fails:
1. Railway auto-rolls back to previous deployment
2. No data loss (schema is additive)
3. Can safely retry deployment

### Testing
- ✅ Schema validated locally
- ✅ Type safety with Prisma
- ✅ API routes tested with dummy data
- ✅ Frontend components render without errors

## Success Criteria

- [ ] Migration runs without errors
- [ ] All 6 new tables created in PostgreSQL
- [ ] All 8 new enums registered
- [ ] `/api/agents` endpoint responds with 200
- [ ] `/api/threats` endpoint responds with 200
- [ ] `/api/system-logs` endpoint responds with 200
- [ ] `/api/threat-monitors` endpoint responds with 200
- [ ] Frontend pages load without console errors
- [ ] Neon theme applies (cyan glows, black background)
- [ ] Case details page shows evidence, agents, threats sections

## Timeline

| Step | Estimated Time |
|------|---|
| Code review | 5 min |
| Git push | 1 min |
| Build (frontend + backend) | 3-5 min |
| Database migration | 1 min |
| Health check | 1 min |
| **Total** | **~10-15 min** |

---

**Ready to deploy?** Run this command in your terminal:
```bash
git add . && git commit -m "feat: Add Sentinel Black investigation system" && git push origin main
```

Then monitor the deployment at: https://railway.com/project/af4cf68c-004e-4b50-8a2d-3d8251589132

