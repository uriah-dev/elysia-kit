# Elysia with Bun runtime

## Development

To start the development server run:

```bash
bun run dev
```

## Deployment

This project supports **three deployment methods** — choose based on your needs:

| Method | Best For | Complexity | Cost |
|--------|----------|------------|------|
| **Vercel** | APIs, startups, serverless | Minimal | Free - $20/mo |
| **PM2** | Simple VPS, solo devs, budget hosting | Low | ~$5/mo |
| **Pulumi/K8s** | Production apps, teams, full observability | High | ~$20+/mo |

📖 **[Deployment Comparison Guide](deploy/DEPLOYMENT_COMPARISON.md)** | 🧹 **[Remove Unwanted Deployment Options](deploy/CLEANUP.md)**


### Option 1: PM2 (Simple VPS)

Deploy to any VPS with Nginx + PM2:

```bash
# First time: setup your VPS
# SSH into your VPS and run: sudo ./deploy/pm2/setup.sh

# From local machine — initial setup
export DEPLOY_HOST=your-vps-ip
bun run deploy:pm2:setup

# Deploy
bun run deploy:pm2
```

📖 **[Full PM2 Deployment Guide](deploy/pm2/README.md)**

### Option 2: Pulumi/K8s (Full Stack)

Deploy to Kubernetes with Prometheus, Grafana, Loki, and Tempo:

```bash
# Install dependencies
bun run infra:install

# Configure (see infra/README.md for details)
# Required: imageRegistry, domain, letsencryptEmail

# Validate configuration
bun run infra:check

# Deploy to dev
bun run infra:dev

# Deploy to production
bun run infra:prod
```

📖 **[Full Pulumi Infrastructure Guide](infra/README.md)**

## Telemetry & Observability

This project includes a full observability stack with Tempo (tracing), Prometheus (metrics), Loki (logs), and Grafana (visualization).

### Start Telemetry Services

```bash
# Generate prometheus.yml from environment variables and start all services
bun run telemetry:up

# Or manually generate config and start
bun run generate:prometheus
docker compose up -d

# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f grafana

# Stop all services
bun run telemetry:down
# Or: docker compose down

# Restart a specific service
docker compose restart tempo
```

**Note:** `prometheus.yml` is auto-generated from the `METRICS_EXPORTER_PORT` environment variable. If you change this port, regenerate the config with `bun run generate:prometheus`.

### Service URLs

| Service    | URL                   | Purpose                 |
| ---------- | --------------------- | ----------------------- |
| Grafana    | http://localhost:3001 | Visualization dashboard |
| Prometheus | http://localhost:9090 | Metrics queries         |
| Tempo      | http://localhost:3200 | Tracing backend         |
| Loki       | http://localhost:3100 | Logs backend            |

### View in Grafana

1. Open http://localhost:3001
2. Go to **Explore** (compass icon)
3. Select data source:
   - **Prometheus** — for metrics
   - **Tempo** — for traces
   - **Loki** — for logs
