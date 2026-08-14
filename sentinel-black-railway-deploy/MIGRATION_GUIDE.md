# Sentinel Black - Database Migration Guide

## Overview
This guide covers deploying the new database schema with Agent, Threat, SystemLog, and ThreatMonitor models to your Railway PostgreSQL instance.

## New Database Models

### Agent (agents table)
- **Purpose**: Track investigation agents assigned to cases
- **Fields**: agentId, name, status, specialization, clearanceLevel, caseId, userId
- **Relationships**: Links to Case and User

### Threat (threats table)
- **Purpose**: Track identified and detected threats
- **Fields**: threatId, name, description, threatType, severity, status, source, intel
- **Relationships**: Linked to Cases via case_threats junction table

### CaseThreat (case_threats table)
- **Purpose**: Junction table linking Cases to Threats (many-to-many)
- **Relationships**: Connects Case ↔ Threat

### SystemLog (system_logs table)
- **Purpose**: Track all system operations, errors, and security events
- **Fields**: logType, component, message, severity, metadata, stackTrace, threatId
- **Relationships**: Optionally links to Threat

### ThreatMonitor (threat_monitors table)
- **Purpose**: Configure automated threat monitoring rules
- **Fields**: name, description, monitorType, threshold, isActive, userId
- **Relationships**: Owns AlertRule records

### AlertRule (alert_rules table)
- **Purpose**: Define alert conditions for threat monitors
- **Fields**: monitorId, condition, action, isEnabled
- **Relationships**: Belongs to ThreatMonitor

## Enums Added
- `AgentStatus`: ACTIVE, INACTIVE, ON_LEAVE, DEPLOYED
- `ClearanceLevel`: LEVEL_1 through LEVEL_5
- `ThreatType`: MALWARE, INTRUSION, DDoS, DATA_BREACH, SOCIAL_ENGINEERING, CONFIGURATION, UNKNOWN
- `ThreatSeverity`: LOW, MEDIUM, HIGH, CRITICAL
- `ThreatStatus`: DETECTED, ANALYZING, CONFIRMED, MITIGATING, RESOLVED, CLOSED
- `SystemLogType`: ERROR, WARNING, INFO, DEBUG, SECURITY, AUDIT
- `LogSeverity`: INFO, WARNING, ERROR, CRITICAL
- `MonitorType`: TRAFFIC, THREAT, PERFORMANCE, SECURITY

## Deployment Steps

### Option 1: Automatic Deployment (Recommended)
Railway will automatically run migrations on deploy if you have `preDeployCommand` set in your service config:

```bash
npx prisma migrate deploy
```

This is already configured in your `sb-railway` service.

### Option 2: Manual Migration via Railway CLI
```bash
# Connect to your Railway project
railway link

# Connect to the PostgreSQL service
railway run npx prisma migrate deploy
```

### Option 3: Manual Migration via SSH/Direct DB
If you need to manually apply the SQL:

1. Connect to your PostgreSQL instance
2. Run the SQL from `prisma/migrations/1786696698_add_agents_threats_monitoring/migration.sql`

## Verification

After migration, verify the new tables exist:

```bash
# Check new tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('agents', 'threats', 'case_threats', 'system_logs', 'threat_monitors', 'alert_rules');

# Check enum types
SELECT typname FROM pg_type WHERE typtype = 'e' 
AND typname IN ('AgentStatus', 'ClearanceLevel', 'ThreatType', 'ThreatSeverity', 
                'ThreatStatus', 'SystemLogType', 'LogSeverity', 'MonitorType');
```

## Rollback (If Needed)

Prisma doesn't have built-in rollback, but you can restore from backup:

1. Create a new PostgreSQL instance from backup in Railway
2. Point service back to old instance
3. Contact Railway support if backup restore is needed

## API Endpoints Ready

After migration, these endpoints become active:

```
GET/POST   /api/agents
GET/PUT/DELETE /api/agents/:id

GET/POST   /api/threats
GET/PUT/DELETE /api/threats/:id
POST       /api/threats/:threatId/link/:caseId

GET/POST   /api/system-logs
GET        /api/system-logs/by-severity/:severity
GET        /api/system-logs/by-component/:component
DELETE     /api/system-logs/clear-old/:daysOld

GET/POST   /api/threat-monitors
GET/PUT/DELETE /api/threat-monitors/:id
POST       /api/threat-monitors/:id/rules
DELETE     /api/threat-monitors/rules/:ruleId
```

## Frontend Pages Ready

New investigation pages are now accessible:

- `/admin/agents` - Agent roster
- `/admin/cases` - Case management
- `/admin/cases/:id` - Case details with linked threats and agents
- `/admin/evidence` - Evidence vault
- `/admin/threat-monitor` - Threat detection dashboard
- `/admin/system-logs` - System activity logs

## Next Steps

1. Deploy to Railway (`git push`)
2. Monitor build logs to confirm migration applies
3. Test API endpoints with Postman or curl
4. Test frontend pages in browser
5. Create seed data if needed (agents, sample threats, logs)

## Support

If migration fails:
1. Check Prisma logs in deployment
2. Verify DATABASE_URL environment variable is set
3. Ensure PostgreSQL version compatibility (13+)
4. Contact support with deployment logs

