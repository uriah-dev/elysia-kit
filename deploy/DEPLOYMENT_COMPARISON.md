# Deployment Method Comparison

Choose the deployment method that best fits your needs. This guide compares **Vercel**, **PM2**, and **Pulumi/Kubernetes** deployments for elysia-kit.

## Quick Comparison

| Feature | Vercel | PM2 (VPS) | Pulumi/K8s |
|---------|--------|-----------|------------|
| **Complexity** | ⭐ Minimal | ⭐⭐ Low | ⭐⭐⭐ High |
| **Setup Time** | ~5 minutes | ~30 minutes | ~2 hours |
| **Monthly Cost** | Free tier / $20+ | $5-20 | $20-100+ |
| **Scaling** | Automatic | Vertical + cluster mode | Horizontal replicas |
| **Best For** | APIs, startups, JAMstack | Solo devs, MVPs | Teams, production apps |
| **Observability** | Vercel Analytics | PM2 monitoring only | Full stack (Prometheus, Grafana, Loki, Tempo) |

## Detailed Comparison

### Infrastructure

| Aspect | Vercel | PM2 | Pulumi/K8s |
|--------|--------|-----|------------|
| **Server Type** | Serverless | Single VPS | Kubernetes cluster |
| **Process Manager** | Managed | PM2 | Kubernetes |
| **Reverse Proxy** | Edge Network | Nginx | Traefik Ingress |
| **SSL/TLS** | Automatic | Certbot (manual renewal) | cert-manager (auto-renewal) |
| **Load Balancer** | Edge Network | Nginx upstream | K8s Service |

### Deployment

| Aspect | Vercel | PM2 | Pulumi/K8s |
|--------|--------|-----|------------|
| **Deployment Method** | Git push / `vc deploy` | Git pull + PM2 reload | Docker + Pulumi |
| **Zero Downtime** | ✅ Yes | ✅ Yes (`pm2 reload`) | ✅ Yes (rolling updates) |
| **Rollback** | Dashboard / CLI | Manual git revert | `pulumi stack select`, `pulumi up` |
| **CI/CD** | GitHub integration | GitHub Actions SSH deploy | GitHub Actions + Docker registry |
| **Deployment Time** | ~30 seconds | ~30 seconds | ~2-3 minutes |

### Scaling & Resilience

| Aspect | Vercel | PM2 | Pulumi/K8s |
|--------|--------|-----|------------|
| **Horizontal Scaling** | ✅ Automatic | ❌ No (single server) | ✅ Yes (multiple pods) |
| **Vertical Scaling** | Plan-based | Resize VPS (requires restart) | Adjust resource limits |
| **Auto-restart** | ✅ Automatic | ✅ PM2 auto-restart | ✅ K8s restart policy |
| **Health Checks** | Automatic | Manual PM2 status | Liveness/readiness probes |
| **Cold Starts** | ⚠️ Yes | ❌ No | ❌ No |

### Observability & Monitoring

| Aspect | Vercel | PM2 | Pulumi/K8s |
|--------|--------|-----|------------|
| **Logs** | Vercel Logs (real-time) | PM2 logs (file-based) | Loki (centralized) |
| **Metrics** | Vercel Analytics | PM2 monit | Prometheus + Grafana |
| **Tracing** | ❌ None (add manually) | ❌ None (add manually) | Tempo (built-in) |
| **Dashboards** | Vercel Dashboard | PM2 CLI only | Grafana web UI |

### Database

| Aspect | Vercel | PM2 | Pulumi/K8s |
|--------|--------|-----|------------|
| **Recommended** | Managed DB (Neon, Vercel Postgres) | Managed DB (Neon, Supabase) | Managed DB or StatefulSet |
| **Local PostgreSQL** | ❌ Not supported | ✅ Supported | ✅ StatefulSet included |
| **Migrations** | CI/CD pipeline | Manual `bun run db:migrate` | Port-forward + manual |

### Cost Breakdown

#### Vercel Deployment
- **Serverless**: Free tier (100GB bandwidth, 100k requests)
- **Pro Plan**: $20/month (1TB bandwidth, unlimited requests)
- **Managed DB** (optional): $0-20/month (Vercel Postgres, Neon)
- **Domain**: ~$12/year (or free with Vercel subdomain)
- **Total**: **$0-40/month**

#### PM2 Deployment
- **VPS**: $5-10/month (DigitalOcean, Vultr, Linode)
- **Managed DB** (optional): $0-15/month (Neon free tier, Supabase free tier)
- **Domain**: ~$12/year
- **SSL**: Free (Let's Encrypt)
- **Total**: **$5-25/month**

#### Pulumi/K8s Deployment
- **VPS for K3s**: $20-40/month (4GB+ RAM recommended)
- **Managed DB** (optional): $0-15/month
- **Domain**: ~$12/year
- **SSL**: Free (cert-manager + Let's Encrypt)
- **Storage**: Included in VPS
- **Total**: **$20-60/month**

## When to Choose Each Method

### ✅ Choose Vercel if:
- You want the fastest setup with zero infrastructure management
- You're building an API, startup MVP, or JAMstack app
- You want automatic scaling without configuration
- Your workloads are request-response based (not long-running)
- You prefer managed services over self-hosting

### ✅ Choose PM2 if:
- You're a solo developer or small team
- You want simple, fast deployments with full control
- Cost is a primary concern
- You're building an MVP or side project
- You need long-running background jobs
- You're comfortable with SSH and traditional server management

### ✅ Choose Pulumi/K8s if:
- You're building a production application for a team
- You need horizontal scaling capabilities
- You want comprehensive observability out of the box
- You're planning to grow and need infrastructure that scales
- You want declarative infrastructure-as-code
- You need advanced deployment strategies (blue/green, canary)
- Your team is familiar with Kubernetes

## Migration Path

You can start simple and migrate as you grow:

1. **Start**: Deploy with Vercel to validate your idea instantly
2. **Grow**: Move to PM2 if you need persistent connections or lower costs
3. **Scale**: Migrate to Kubernetes when you need horizontal scaling
4. **Observe**: Add full observability stack as your team grows

## Quick Start Commands

### Vercel Setup
```bash
# Install Vercel CLI
npm i -g vercel

# Local development
bun run vercel:dev

# Deploy to production
bun run vercel:deploy:prod
```

### PM2 Setup
```bash
# On VPS
sudo ./deploy/pm2/setup.sh

# From local machine
export DEPLOY_HOST=your-vps-ip
bun run deploy:pm2:setup
bun run deploy:pm2
```

### Pulumi/K8s Setup
```bash
cd infra
bun install
pulumi stack init production
./sync-env-to-pulumi.sh production
pulumi up
```

---

**Still undecided?** Start with Vercel for instant deployment. You can always migrate later, and all deployment methods coexist peacefully in this repository.
