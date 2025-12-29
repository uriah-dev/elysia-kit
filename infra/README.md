# Pulumi Infrastructure

Kubernetes infrastructure for deploying elysia-kit to your VPS with K3s.

## Directory Structure

```
infra/
├── Pulumi.yaml              # Project config (bun runtime)
├── Pulumi.dev.yaml          # Dev environment 
├── Pulumi.production.yaml   # Production environment
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── index.ts                 # Main entry point
└── src/
    ├── config.ts            # Environment-aware config
    ├── namespace.ts         # K8s namespace
    ├── app/
    │   ├── deployment.ts    # App deployment
    │   ├── service.ts       # ClusterIP service
    │   ├── ingress.ts       # Traefik ingress
    │   ├── configmap.ts     # Non-sensitive config
    │   └── secrets.ts       # Sensitive credentials
    ├── database/
    │   └── postgres.ts      # PostgreSQL StatefulSet
    └── observability/
        ├── index.ts         # Stack orchestrator
        ├── prometheus.ts    # Metrics
        ├── grafana.ts       # Visualization
        ├── loki.ts          # Logs
        └── tempo.ts         # Tracing
```

## Getting Started

### Quick Start (TL;DR)

New to this project? Here's the fastest path to deployment:

```bash
# 1. Install dependencies
bun install

# 2. Copy and edit config template
cp Pulumi.dev.yaml.example Pulumi.dev.yaml
# Edit Pulumi.dev.yaml with your domain, registry, and email

# 3. Validate configuration
bun run infra:check

# 4. Deploy to dev
bun run infra:dev
```

That's it! Read below for detailed setup instructions.

---

### 1. Install Pulumi CLI

```bash
brew install pulumi
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Initialize Stacks

```bash
# Create dev stack
pulumi stack init dev

# Create production stack  
pulumi stack init production
```

### 4. Configure Required Settings

**IMPORTANT**: Three settings are required before deployment:

```bash
# Select your stack
pulumi stack select dev

# REQUIRED: Your Docker registry (where your images are stored)
pulumi config set imageRegistry docker.io/YOUR_DOCKERHUB_USERNAME

# REQUIRED: Your domain name
pulumi config set domain dev.yourdomain.com

# REQUIRED: Email for Let's Encrypt SSL certificates
pulumi config set letsencryptEmail you@yourdomain.com
```

**TIP**: You can use the config templates as a starting point:

```bash
cp Pulumi.dev.yaml.example Pulumi.dev.yaml
# Edit Pulumi.dev.yaml with your values
```

### 5. Validate Configuration

Run the preflight check to ensure all required configuration is set:

```bash
bun run infra:check
```

This will validate your configuration and provide helpful error messages if anything is missing.

### 6. Configure Secrets

You can configure secrets manually or use the sync script.

#### Option A: Sync from .env file (Recommended)

Create a `.env` file in the project root with your values, then run:

```bash
./sync-env-to-pulumi.sh dev        # Sync to dev stack
./sync-env-to-pulumi.sh production # Sync to production stack
```

**Expected .env variables:**

| .env Variable | Pulumi Config | Secret? |
|---------------|---------------|---------|
| `IMAGE_REGISTRY` | `imageRegistry` | No |
| `IMAGE_TAG` | `imageTag` | No |
| `APP_DOMAIN` | `domain` | No |
| `LETSENCRYPT_EMAIL` | `letsencryptEmail` | No |
| `LOG_LEVEL` | `logLevel` | No |
| `REPLICAS` | `replicas` | No |
| `DB_NAME` | `dbName` | No |
| `DB_USER` | `dbUser` | No |
| `DB_STORAGE_SIZE` | `dbStorageSize` | No |
| `RESEND_MAIL` | `resendMail` | No |
| `TRIGGER_PROJECT_ID` | `triggerProjectId` | No |
| `DB_PASSWORD` | `dbPassword` | **Yes** |
| `RESEND_API_KEY` | `resendApiKey` | **Yes** |
| `TRIGGER_SECRET_KEY` | `triggerSecretKey` | **Yes** |

#### Option B: Manual configuration

```bash
# Select stack
pulumi stack select dev

# Set required secrets
pulumi config set --secret dbPassword "your-db-password"
pulumi config set --secret resendApiKey "re_xxxxx"
pulumi config set resendMail "noreply@yourdomain.com"
pulumi config set --secret triggerSecretKey "tr_xxxxx"
pulumi config set triggerProjectId "your-project-id"

# Set image registry (update to your registry)
pulumi config set imageRegistry "docker.io/your-username"
```

### 7. Deploy

```bash
# Preview changes
pulumi preview

# Deploy to dev
pulumi up --stack dev

# Deploy to production
pulumi up --stack production
```

Or from project root:

```bash
bun run infra:dev        # Deploy to dev
bun run infra:prod       # Deploy to production
bun run infra:preview    # Preview changes
```

## VPS Setup (K3s)

Install K3s on your VPS:

```bash
# On your VPS
curl -sfL https://get.k3s.io | sh -

# Get kubeconfig
sudo cat /etc/rancher/k3s/k3s.yaml
```

Copy kubeconfig to your local machine and set `KUBECONFIG`:

```bash
export KUBECONFIG=~/.kube/vps-config
```

## Docker Workflow

```bash
# Build image
docker build -t elysia-kit:latest ..

# Tag for your registry
docker tag elysia-kit:latest your-registry/elysia-kit:v1.0.0

# Push
docker push your-registry/elysia-kit:v1.0.0

# Update Pulumi config
pulumi config set imageTag v1.0.0
```

## Environment Differences

| Setting | Dev | Production |
|---------|-----|------------|
| Replicas | 1 | 3 |
| CPU Request | 100m | 250m |
| Memory Limit | 512Mi | 1Gi |
| DB Storage | 5Gi | 20Gi |
| TLS | Staging Cert | Production Cert |
| Log Level | debug | info |

## SSL/TLS with Let's Encrypt

Automatic HTTPS certificates via cert-manager and Let's Encrypt.

### Setup

cert-manager is installed on the cluster and configured with two ClusterIssuers:
- **letsencrypt-staging** - For dev/testing (fake certificates)
- **letsencrypt-prod** - For production (real certificates)

### Configuration

Set your email for Let's Encrypt notifications:

```bash
pulumi config set letsencryptEmail your-email@domain.com
```

### Certificate Status

Check certificate status:

```bash
export KUBECONFIG=~/.kube/vps-config
kubectl get certificate -n elysia-kit-dev
kubectl describe certificate elysia-kit-tls -n elysia-kit-dev
```

### Auto-Renewal

cert-manager automatically renews certificates 30 days before expiry. No manual intervention needed!

### Switching to Production Certificates

By default, dev uses `letsencrypt-staging`. To use production certificates:

```bash
# This is automatic when you deploy to production stack
pulumi stack select production
pulumi up
```

## Commands Reference

| Command | Description |
|---------|-------------|
| `pulumi preview` | Preview changes |
| `pulumi up` | Deploy infrastructure |
| `pulumi destroy` | Tear down infrastructure |
| `pulumi stack ls` | List stacks |
| `pulumi config` | View configuration |

## Database Migrations

After deploying for the first time, you need to run migrations to create database tables.

### Using drizzle-kit push

Port-forward the database and push the schema:

```bash
# Port-forward PostgreSQL
export KUBECONFIG=~/.kube/vps-config
kubectl port-forward -n elysia-kit-dev svc/postgres 5432:5432 &

# Push schema (from project root)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/elysia_kit_dev" \
APP_PORT=3000 APP_NAME=migration APP_URL=http://localhost:3000 \
RESEND_API_KEY=fake RESEND_MAIL=test@example.com \
TEMPO_URL=http://localhost:4318 LOKI_URL=http://localhost:3100 \
bunx drizzle-kit push --force

# Stop port-forward
pkill -f "port-forward"
```

### Verify Tables

```bash
kubectl exec -n elysia-kit-dev postgres-0 -- psql -U postgres -d elysia_kit_dev -c "\dt"
```

## Observability

The stack includes Prometheus, Grafana, Loki, and Tempo for full observability.

### Accessing Grafana

Grafana is available at `https://monitoring.<your-domain>` (configured via Ingress based on your `grafanaDomain` or defaults to `monitoring.<domain>`).

### Viewing Logs (Loki)

1. Open Grafana → **Explore**
2. Select **Loki** as datasource
3. Use LogQL queries like `{app="elysia-kit"}`

### Viewing Traces (Tempo)

1. Open Grafana → **Explore**
2. Select **Tempo** as datasource
3. Use the **Search** tab with filter `{}`

### Environment Variables for Telemetry

The ConfigMap includes internal service URLs for telemetry:

| Variable | Value | Purpose |
|----------|-------|---------|
| `LOKI_URL` | `http://loki:3100` | Log shipping endpoint |
| `TEMPO_URL` | `http://tempo:4318` | Trace export endpoint (OTLP HTTP) |

## Troubleshooting

### "Failed query" / Database Table Not Found

The database has no tables. Run migrations (see Database Migrations section above).

### Logs not appearing in Loki

Check that the app is using internal service URLs, not external domains:
```bash
kubectl exec -n elysia-kit-dev deploy/elysia-kit -- env | grep LOKI
# Should show: LOKI_URL=http://loki:3100
```

### Traces not appearing in Tempo

1. Verify Tempo OTLP endpoints are listening:
```bash
kubectl run debug --image=busybox --rm -it -n elysia-kit-dev -- wget -q -O- http://tempo:4318
# Should return 404 (not connection refused)
```

2. Check Tempo logs for ingestion:
```bash
kubectl logs -l component=tempo -n elysia-kit-dev | grep "head block cut"
```

### PVC Timeout Errors

If you see PVC timeout errors during `pulumi up`, this is usually a storage provisioner issue. The resources may still be created successfully. Check:
```bash
kubectl get pvc -n elysia-kit-dev
```

### Certificate Issues

Check cert-manager logs and certificate status:
```bash
kubectl get certificate -n elysia-kit-dev
kubectl describe certificate elysia-kit-tls -n elysia-kit-dev
kubectl logs -n cert-manager deploy/cert-manager
```

### Pod CrashLoopBackOff

Check pod logs for errors:
```bash
kubectl logs -l component=app -n elysia-kit-dev --tail=50
```

Common causes:
- Missing environment variables
- Database connection issues
- Application startup errors
