# 🔴 SENTINEL BLACK - Complete Investigation System

**Status**: ✅ READY FOR DEPLOYMENT

## System Overview

Sentinel Black is a comprehensive digital forensics and investigation platform with a futuristic neon hologram aesthetic. It manages cases, evidence, agents, threats, and system monitoring with a dark theme command-center interface.

```
┌─────────────────────────────────────────────────────────┐
│                  SENTINEL BLACK NETWORK                 │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ Cases    │  │ Evidence │  │  Agents  │             │
│  │ Mgmt     │  │  Vault   │  │ Roster   │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ Threats  │  │  System  │  │ Monitors │             │
│  │ Monitor  │  │   Logs   │  │ & Alerts │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│                                                         │
│              ← HOLOGRAM NEON UI THEME →               │
│          Black Background • Cyan Glows • Red Alerts    │
└─────────────────────────────────────────────────────────┘
```

## Architecture

### Backend (Node.js + Express + Prisma)
```
src/
├── server.ts                    # Express app with all routes mounted
├── routes/
│   ├── agents.ts               # Agent CRUD & management
│   ├── threats.ts              # Threat detection & linking
│   ├── systemLogs.ts           # System activity logging
│   ├── threatMonitors.ts       # Alert rules & monitoring
│   ├── cases.ts                # Case management (existing)
│   ├── evidence.ts             # Evidence handling (existing)
│   ├── incidents.ts            # Incident tracking (existing)
│   └── missions.ts             # Mission coordination (existing)
├── middleware/
│   └── adminAuth.ts            # Protected route auth
└── services/
    ├── audit.ts                # Audit logging
    └── [other services]
```

### Frontend (Next.js 13+ App Router)
```
frontend/app/
├── admin/
│   ├── cases/
│   │   ├── page.tsx            # List all cases
│   │   └── [id]/page.tsx       # Case details + linked data
│   ├── evidence/
│   │   ├── page.tsx            # Evidence vault
│   │   └── [id]/page.tsx       # Evidence viewer + chain of custody
│   ├── agents/
│   │   ├── page.tsx            # Agent roster
│   │   └── [id]/page.tsx       # Agent profile (pending)
│   ├── threat-monitor/
│   │   ├── page.tsx            # Live threat dashboard
│   │   └── [id]/page.tsx       # Threat analysis (pending)
│   ├── system-logs/
│   │   └── page.tsx            # System activity log
│   ├── settings/
│   │   └── page.tsx            # Settings & theme
│   └── dashboard/
│       └── page.tsx            # Main dashboard
├── components/
│   ├── NeonCard.tsx            # Glowing card component
│   ├── NeonButton.tsx          # Interactive button
│   └── StatusBadge.tsx         # Status indicators
└── lib/
    └── neonTheme.ts            # Theme utilities & colors
```

### Database (PostgreSQL)
```
Tables Added:
├── agents              # Investigation agents
├── threats             # Detected threats
├── case_threats        # Case ↔ Threat junction
├── system_logs         # System & security logs
├── threat_monitors     # Automated monitoring
└── alert_rules         # Monitor alert conditions

Existing Tables:
├── users
├── cases
├── evidence
├── incidents
├── missions
├── patterns
└── [other original tables]
```

## API Reference

### Agent Management
```
GET    /api/agents                   # List all agents
POST   /api/agents                   # Deploy new agent
GET    /api/agents/:id               # Get agent details
PUT    /api/agents/:id               # Update agent
DELETE /api/agents/:id               # Remove agent
```

### Threat Detection
```
GET    /api/threats                  # List threats
POST   /api/threats                  # Report new threat
GET    /api/threats/:id              # Threat details
PUT    /api/threats/:id              # Update threat status
POST   /api/threats/:threatId/link/:caseId  # Link to case
DELETE /api/threats/:id              # Remove threat
```

### System Monitoring
```
GET    /api/system-logs              # Get logs (paginated)
GET    /api/system-logs/:id          # Single log details
GET    /api/system-logs/by-severity/:severity
GET    /api/system-logs/by-component/:component
DELETE /api/system-logs/clear-old/:daysOld  # Archive old logs
```

### Threat Monitors
```
GET    /api/threat-monitors          # List monitors
POST   /api/threat-monitors          # Create monitor
GET    /api/threat-monitors/:id      # Monitor settings
PUT    /api/threat-monitors/:id      # Update monitor
POST   /api/threat-monitors/:id/rules        # Add alert rule
DELETE /api/threat-monitors/:id/rules/:ruleId
DELETE /api/threat-monitors/:id      # Remove monitor
```

## Database Models

### Agent
```prisma
model Agent {
  id              String      @id @default(cuid())
  agentId         String      @unique
  name            String
  status          AgentStatus @default(ACTIVE)
  specialization  String?
  clearanceLevel  ClearanceLevel @default(LEVEL_3)
  caseId          String?
  case            Case?       @relation(fields: [caseId])
  userId          String?
  user            User?       @relation(fields: [userId])
  assignedAt      DateTime    @default(now())
}
```

### Threat
```prisma
model Threat {
  id          String          @id @default(cuid())
  threatId    String          @unique
  name        String
  description String
  threatType  ThreatType
  severity    ThreatSeverity  @default(LOW)
  status      ThreatStatus    @default(DETECTED)
  intel       String?
  source      String?
  cases       CaseThreat[]
  logs        SystemLog[]
  detectedAt  DateTime        @default(now())
  resolvedAt  DateTime?
}
```

### CaseThreat
```prisma
model CaseThreat {
  id        String   @id @default(cuid())
  caseId    String
  case      Case     @relation(fields: [caseId], onDelete: Cascade)
  threatId  String
  threat    Threat   @relation(fields: [threatId], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([caseId, threatId])
}
```

### SystemLog
```prisma
model SystemLog {
  id          String       @id @default(cuid())
  logType     SystemLogType
  component   String
  message     String
  severity    LogSeverity  @default(INFO)
  threatId    String?
  threat      Threat?      @relation(fields: [threatId])
  metadata    Json?
  stackTrace  String?
  createdAt   DateTime     @default(now())
}
```

### ThreatMonitor
```prisma
model ThreatMonitor {
  id          String      @id @default(cuid())
  name        String
  description String?
  monitorType MonitorType
  threshold   Int?
  isActive    Boolean     @default(true)
  userId      String
  user        User        @relation(fields: [userId])
  alertRules  AlertRule[]
  createdAt   DateTime    @default(now())
}
```

### AlertRule
```prisma
model AlertRule {
  id        String      @id @default(cuid())
  monitorId String
  monitor   ThreatMonitor @relation(fields: [monitorId], onDelete: Cascade)
  condition String
  action    String
  isEnabled Boolean     @default(true)
  createdAt DateTime    @default(now())
}
```

## UI Theme

### Color Palette
```
Background:     #000000 (Pure Black)
Primary Glow:   #ffffff (White with cyan glow)
Accent Glow:    #ff0000 (Red for critical)
Border Glow:    #00ffff (Cyan)
Success Glow:   #00ff00 (Green)
Warning Glow:   #ffff00 (Yellow)
Info Glow:      #00ffff (Cyan)
```

### Components
- **NeonCard**: Dark card with glowing borders
- **NeonButton**: Interactive buttons with hover glow effects
- **StatusBadge**: Color-coded status indicators with severity
- **Table rows**: Striped with subtle glow on hover

## Deployment Checklist

### Pre-Deployment
- [x] Database schema finalized
- [x] Migration SQL created
- [x] All API routes implemented
- [x] Frontend pages built
- [x] UI components styled
- [x] Express server integration complete
- [x] Environment variables documented
- [x] Error handling implemented
- [ ] End-to-end tests (coming)
- [ ] Load testing (optional)

### Deployment Steps
1. **Commit**: `git add . && git commit -m "feat: Add Sentinel Black investigation system"`
2. **Push**: `git push origin main`
3. **Railway**: Monitor build at https://railway.com/project/af4cf68c-004e-4b50-8a2d-3d8251589132
4. **Verify**: Run `/health` endpoint check
5. **Test**: Access frontend at https://frontend-production-8681.up.railway.app/admin/cases

### Migration Details
- **File**: `prisma/migrations/1786696698_add_agents_threats_monitoring/migration.sql`
- **Lines**: 157 SQL statements
- **Tables**: 6 new tables created
- **Enums**: 8 new enum types
- **Indexes**: 3 indexes for performance
- **Constraints**: Foreign keys enforce data integrity

## Post-Deployment

### First-Run Setup
1. Log in to admin dashboard
2. Create test agents from `/admin/agents`
3. Create test threats from `/admin/threat-monitor`
4. Create test cases from `/admin/cases`
5. Link threats to cases
6. Assign agents to cases

### Testing Endpoints
```bash
# Health check
curl https://sb-railway-production.up.railway.app/health

# List endpoints
curl https://sb-railway-production.up.railway.app/api

# Create agent (requires auth)
curl -X POST https://sb-railway-production.up.railway.app/api/agents \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Agent Nova",
    "specialization": "Cyber Forensics",
    "clearanceLevel": "LEVEL_2"
  }'
```

## Future Enhancements

### Phase 2
- [ ] Evidence file upload handler
- [ ] Agent detail pages with assignment history
- [ ] Threat analysis with ML correlation
- [ ] Real-time WebSocket updates
- [ ] Notification system
- [ ] Report generation (PDF)

### Phase 3
- [ ] Multi-user case collaboration
- [ ] Full-text search across evidence
- [ ] Timeline visualization
- [ ] Threat intelligence feeds
- [ ] Automated threat correlation
- [ ] Mobile app

## Support & Troubleshooting

### Migration Failed
1. Check `DATABASE_URL` environment variable
2. Verify PostgreSQL version (13+)
3. Check Railway deployment logs
4. Railway auto-rolls back on failure (safe)

### API Not Responding
1. Verify backend is online at `/health`
2. Check `NEXT_PUBLIC_API_URL` frontend env var
3. Verify CORS origin matches frontend domain
4. Check server logs for errors

### Frontend Not Loading
1. Clear browser cache
2. Check `NODE_ENV=production`
3. Verify JWT_SECRET is set
4. Check for console errors (browser DevTools)

## Project Links

- **Dashboard**: https://railway.com/project/af4cf68c-004e-4b50-8a2d-3d8251589132
- **Frontend**: https://frontend-production-8681.up.railway.app/admin/dashboard
- **Backend API**: https://sb-railway-production.up.railway.app
- **GitHub**: https://github.com/malayakeys32-rgb/sb-railway

---

**Status**: ✅ READY FOR DEPLOYMENT TO RAILWAY

**Next Command**:
```bash
git push origin main
```

Then monitor the deployment and verify endpoints are responding.

