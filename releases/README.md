# Releases Folder

**Owner:** release-agent
**Purpose:** Deployment logs, release notes, and audit trail of production releases

## What Goes Here

This folder contains **release documentation** created by the release-agent when deploying to staging or production environments.

**Document Format:** `YYYY-MM-DD-feature-name.md` or `release-YYYY-MM-DD.md`

**Content Includes:**
- Deployment timestamp and environment (staging, production)
- What features/fixes were included
- Migration notes (if database changes)
- Configuration changes
- Rollback procedures
- Post-deployment verification results
- Issues encountered (if any)

## Workflow

1. **finishing-agent** completes QA review
2. User decides to deploy
3. **release-agent** executes deployment
4. **release-agent** creates/updates release document here
5. **release-agent** monitors and verifies deployment

## Document Structure

### Per-Feature Release Docs
```
/releases/
├── 2025-12-02-confirmations-module.md
│   ├── Staging deployment (2025-12-02 14:30)
│   ├── Production deployment (2025-12-02 16:45)
│   ├── Rollback plan
│   └── Post-deployment notes
```

### Release Log
```
/releases/
└── release-log.md (chronological list of all deployments)
```

## Release Document Template

Each release document should include:
- **Feature Name**: What was deployed
- **Date**: When it was deployed
- **Environment**: Staging, Production
- **Included Changes**: List of features/fixes
- **Database Migrations**: Any schema changes
- **Configuration Changes**: Environment variable updates
- **Rollback Plan**: How to revert if needed
- **Verification Steps**: How to confirm deployment succeeded
- **Status**: Success, Partial, Rolled Back
- **Issues**: Any problems encountered

## Audit Trail

This folder serves as an **audit trail** for:
- Compliance (who deployed what, when)
- Debugging (what changed between versions)
- Rollback reference (how to undo deployments)
- Release planning (deployment frequency, patterns)

## Notes

- **Never delete release documents** - they're permanent audit records
- If a deployment is rolled back, document why and what went wrong
- Link release docs back to `/requirements/` folder for full context
