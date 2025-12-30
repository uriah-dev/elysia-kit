# Removing Deployment Options

This guide explains how to remove deployment options you don't need to reduce your project's bundle size and complexity.

## Quick Command Summary

```bash
# Remove only PM2
rm -rf deploy/pm2 ecosystem.config.cjs logs/

# Remove only Vercel
rm -rf deploy/vercel api/ vercel.json .vercel/

# Remove only Pulumi/Kubernetes
rm -rf infra/

# Remove ALL deployment options
rm -rf deploy/ infra/ api/ vercel.json ecosystem.config.cjs .vercel/ logs/
```

---

## Removing PM2 Deployment

PM2 is used for process management on traditional VPS servers.

### Files to Remove

| Path | Description |
|------|-------------|
| `deploy/pm2/` | PM2 setup scripts and README |
| `ecosystem.config.cjs` | PM2 configuration file |
| `logs/` | PM2 log directory (if exists) |

### Commands

```bash
# Remove PM2 files
rm -rf deploy/pm2
rm -f ecosystem.config.cjs
rm -rf logs/

# Remove PM2 scripts from package.json (optional)
# Edit package.json and remove:
#   - "pm2:start"
#   - "pm2:stop"
#   - "pm2:reload"
#   - "pm2:logs"
#   - "deploy:pm2"
#   - "deploy:pm2:setup"
```

### .gitignore Cleanup

Remove these lines from `.gitignore`:
```
# PM2
logs/
dist/
```

---

## Removing Vercel Deployment

Vercel is used for serverless deployment.

### Files to Remove

| Path | Description |
|------|-------------|
| `deploy/vercel/` | Vercel documentation |
| `api/` | Vercel serverless function entry point |
| `vercel.json` | Vercel configuration |
| `.vercel/` | Vercel local cache (if exists) |

### Commands

```bash
# Remove Vercel files
rm -rf deploy/vercel
rm -rf api/
rm -f vercel.json
rm -rf .vercel/

# Remove Vercel scripts from package.json (optional)
# Edit package.json and remove:
#   - "vercel:dev"
#   - "vercel:deploy"
#   - "vercel:deploy:prod"
```

### .gitignore Cleanup

Remove these lines from `.gitignore`:
```
# Vercel build output
api/index.js
```

---

## Removing Pulumi/Kubernetes Deployment

Pulumi is used for infrastructure-as-code deployment to Kubernetes.

### Files to Remove

| Path | Description |
|------|-------------|
| `infra/` | Entire Pulumi infrastructure directory |

### Commands

```bash
# Remove Pulumi/K8s infrastructure
rm -rf infra/

# If you're currently using Pulumi, first destroy resources:
# cd infra && pulumi destroy && cd .. && rm -rf infra/
```

> **Warning**: If you have active Pulumi stacks, run `pulumi destroy` before deleting the directory to avoid orphaned cloud resources.

---

## Removing ALL Deployment Options

If you want to start fresh with your own deployment strategy:

```bash
# Remove everything
rm -rf deploy/
rm -rf infra/
rm -rf api/
rm -f vercel.json
rm -f ecosystem.config.cjs
rm -rf .vercel/
rm -rf logs/
```

### Clean package.json

Remove these scripts from `package.json`:

```json
{
  "scripts": {
    // Remove PM2 scripts
    "pm2:start": "...",
    "pm2:stop": "...",
    "pm2:reload": "...",
    "pm2:logs": "...",
    "deploy:pm2": "...",
    "deploy:pm2:setup": "...",
    
    // Remove Vercel scripts
    "vercel:dev": "...",
    "vercel:deploy": "...",
    "vercel:deploy:prod": "..."
  }
}
```

---

## Bundle Size Impact

| Component | Approximate Size |
|-----------|-----------------|
| `infra/` | ~100KB (source) + ~65KB (bun.lock) |
| `deploy/pm2/` | ~15KB |
| `deploy/vercel/` | ~5KB |
| `api/` | ~1KB (source) or ~18MB (bundled) |
| `ecosystem.config.cjs` | ~1KB |

> **Note**: The largest impact is the `api/index.js` bundled file (~18MB). If you're not using Vercel, removing this file significantly reduces your repository size.

---

## After Cleanup

1. **Update README.md**: Remove references to removed deployment methods
2. **Update .gitignore**: Remove irrelevant ignore patterns
3. **Test**: Ensure your remaining deployment method still works
4. **Commit**: `git add . && git commit -m "chore: remove unused deployment options"`
