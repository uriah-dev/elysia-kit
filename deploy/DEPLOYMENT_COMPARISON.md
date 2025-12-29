# Deployment Method Comparison

Choose the deployment method that best fits your needs. This guide compares **PM2** and **Pulumi/Kubernetes** deployments for elysia-kit.

## Quick Comparison

| Feature | PM2 (VPS) | Pulumi/K8s |
|---------|-----------|------------|
| **Complexity** | ⭐ Low | ⭐⭐⭐ High |
| **Setup Time** | ~30 minutes | ~2 hours |
| **Monthly Cost** | $5-20 | $20-100+ |
| **Scaling** | Vertical + cluster mode | Horizontal replicas |
| **Best For** | Solo devs, MVPs, simple apps | Teams, production apps |
| **Observability** | PM2 monitoring only | Full stack (Prometheus, Grafana, Loki, Tempo) |

## Detailed Comparison

### Infrastructure

| Aspect | PM2 | Pulumi/K8s |
|--------|-----|------------|
| **Server Type** | Single VPS | Kubernetes cluster |
| **Process Manager** | PM2 | Kubernetes |
| **Reverse Proxy** | Nginx | Traefik Ingress |
| **SSL/TLS** | Certbot (manual renewal) | cert-manager (auto-renewal) |
| **Load Balancer** | Nginx upstream | K8s Service |

### Deployment

| Aspect | PM2 | Pulumi/K8s |
|--------|-----|------------|
| **Deployment Method** | Git pull + PM2 reload | Docker + Pulumi |
| **Zero Downtime** | ✅ Yes (`pm2 reload`) | ✅ Yes (rolling updates) |
| **Rollback** | Manual git revert | `pulumi stack select`, `pulumi up` |
| **CI/CD** | GitHub Actions SSH deploy | GitHub Actions + Docker registry |
| **Deployment Time** | ~30 seconds | ~2-3 minutes |

### Scaling & Resilience

| Aspect | PM2 | Pulumi/K8s |
|--------|-----|------------|
| **Horizontal Scaling** | ❌ No (single server) | ✅ Yes (multiple pods) |
| **Vertical Scaling** | Resize VPS (requires restart) | Adjust resource limits |
| **Auto-restart** | ✅ PM2 auto-restart | ✅ K8s restart policy |
| **Health Checks** | Manual PM2 status | Liveness/readiness probes |
| **Max Instances** | CPU cores | Limited by cluster capacity |
| **Cluster Mode** | ✅ PM2 cluster mode | ✅ Native K8s replicas |

### Observability & Monitoring

| Aspect | PM2 | Pulumi/K8s |
|--------|-----|------------|
| **Logs** | PM2 logs (file-based) | Loki (centralized) |
| **Metrics** | PM2 monit | Prometheus + Grafana |
| **Tracing** | None (add manually) | Tempo (built-in) |
| **Dashboards** | PM2 CLI only | Grafana web UI |
| **Alerting** | None (add manually) | Prometheus Alertmanager |
| **Log Retention** | Disk space limited | Configurable |

### Database

| Aspect | PM2 | Pulumi/K8s |
|--------|-----|------------|
| **Recommended** | Managed DB (Neon, Supabase) | Managed DB or StatefulSet |
| **Local PostgreSQL** | ✅ Supported | ✅ StatefulSet included |
| **Migrations** | Manual `bun run db:migrate` | Port-forward + manual |
| **Backup** | Manual or provider-managed | Manual or provider-managed |

### Cost Breakdown

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

### When to Choose PM2

✅ **Choose PM2 if:**
- You're a solo developer or small team
- You want simple, fast deployments
- Cost is a primary concern
- You're building an MVP or side project
- Your traffic is predictable and moderate
- You don't need advanced observability
- You're comfortable with SSH and traditional server management

### When to Choose Pulumi/K8s

✅ **Choose Pulumi/K8s if:**
- You're building a production application for a team
- You need horizontal scaling capabilities
- You want comprehensive observability out of the box
- You're planning to grow and need infrastructure that scales
- You want declarative infrastructure-as-code
- You need advanced deployment strategies (blue/green, canary)
- Your team is familiar with Kubernetes

## Migration Path

You can start with PM2 and migrate to Kubernetes later:

1. **Start**: Deploy with PM2 to validate your idea quickly
2. **Grow**: As traffic increases, upgrade VPS or add PM2 cluster instances
3. **Scale**: When you need horizontal scaling, migrate to Kubernetes
4. **Observe**: Add full observability stack as your team grows

The migration is straightforward because both use:
- Same Docker container
- Same environment variables
- Same database schema
- Same application code

## Hybrid Approach

You can even run **both** simultaneously:
- **PM2**: Staging environment on a small VPS
- **Pulumi/K8s**: Production environment with full observability

## Support & Maintenance

| Aspect | PM2 | Pulumi/K8s |
|--------|-----|------------|
| **Learning Curve** | Low (Nginx, PM2, SSH) | High (K8s, Pulumi, Docker) |
| **Maintenance** | Low (server updates, SSL renewal) | Medium (cluster upgrades, config management) |
| **Debugging** | Easy (`pm2 logs`, SSH) | Medium (kubectl, pod logs) |
| **Community** | Large PM2 community | Large K8s community |

## Recommended Workflow by Stage

| Stage | Recommended | Why |
|-------|-------------|-----|
| **MVP / Prototype** | PM2 | Fast setup, low cost |
| **Early Product** | PM2 | Still validating, save costs |
| **Growing Product** | PM2 or K8s | Choose based on team size |
| **Scale-up** | Pulumi/K8s | Need horizontal scaling |
| **Enterprise** | Pulumi/K8s | Full observability, compliance |

## Quick Start Commands

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

**Still undecided?** Start with PM2. You can always migrate later, and both deployment methods coexist peacefully in this repository.
