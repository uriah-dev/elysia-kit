# PM2 Deployment Guide

Deploy elysia-kit to a VPS using PM2 for process management and Nginx as a reverse proxy.

## Overview

This deployment method is ideal for:
- **Single VPS deployments** without Kubernetes
- **Simple setups** where you want fast, straightforward deployments
- **Budget-conscious** hosting (any $5/month VPS works)
- **Teams familiar with PM2** and traditional server management

> **Note**: For Kubernetes deployments with full observability stack, see the [Pulumi Infrastructure Guide](../../infra/README.md).

## Prerequisites

- A VPS running Ubuntu 20.04+ or Debian 11+
- SSH access with root or sudo capabilities
- A domain name pointing to your VPS (for SSL)
- Git repository accessible from the VPS

## Local Testing

Before deploying to a VPS, you can test PM2 locally to ensure your application works correctly.

### 1. Install PM2

```bash
npm install -g pm2
```

### 2. Setup Environment Variables

Make sure your `.env` file includes the required telemetry variables:

```bash
# Add to your .env file
LOKI_URL=http://localhost:3100
TEMPO_URL=http://localhost:4318
```

Or copy from the example:

```bash
cp .env.pm2.example .env
# Edit .env with your actual values
```

### 3. Start with PM2

```bash
# Start application with ecosystem config
pm2 start ecosystem.config.cjs

# Or use the npm script
bun run pm2:start
```

### 4. Monitor & Manage

```bash
# Check status
pm2 status

# View logs (live stream)
bun run pm2:logs

# Real-time monitoring dashboard
bun run pm2:monit

# Restart (zero-downtime)
bun run pm2:reload

# Stop application
bun run pm2:stop
```

### 5. Cleanup

```bash
# Stop all processes
pm2 stop all

# Remove all processes
pm2 delete all

# Clear logs
pm2 flush

# Kill PM2 daemon
pm2 kill
```

### Local Testing Notes

**Important Configuration Changes for Bun:**

The ecosystem config has been optimized for Bun compatibility:

- **Exec Mode**: Uses `fork` mode instead of `cluster` (Bun has issues with PM2 cluster mode)
- **Instances**: Set to `2` for local testing (use `'max'` in production)
- **Interpreter Args**: `--bun` flag is commented out (causes errors in some PM2 versions)
- **Ready Signal**: `wait_ready` is disabled for local testing

These settings ensure PM2 works smoothly with Bun's runtime. The config automatically adjusts for production deployments.

### Common Local Testing Issues

**Issue: App keeps restarting**
```bash
# Check error logs
pm2 logs elysia-kit --err

# Common cause: Missing environment variables
# Solution: Ensure .env has all required variables (especially TEMPO_URL, LOKI_URL)
```

**Issue: Port already in use**
```bash
# Check what's using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

**Issue: PM2 not found after installation**
```bash
# Restart your terminal or reload shell config
source ~/.zshrc  # or ~/.bashrc
```

## Quick Start

### 1. Setup VPS (First Time Only)

SSH into your VPS and run the setup script:

```bash
# Download and run setup script
curl -sSL https://raw.githubusercontent.com/your-username/elysia-kit/main/deploy/pm2/setup.sh | sudo bash

# Or manually:
wget https://raw.githubusercontent.com/your-username/elysia-kit/main/deploy/pm2/setup.sh
chmod +x setup.sh
sudo ./setup.sh
```

This installs:
- Bun runtime
- PM2 process manager
- Nginx reverse proxy
- Node.js (required for PM2)
- Certbot for SSL

### 2. Configure Your VPS

After setup, complete these steps on your VPS:

```bash
# 1. Add your SSH key for the deploy user
echo "your-public-key" >> /home/deploy/.ssh/authorized_keys

# 2. Update Nginx with your domain
sudo nano /etc/nginx/sites-available/elysia-kit
# Change: server_name your-domain.com www.your-domain.com;
sudo nginx -t && sudo systemctl reload nginx

# 3. Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 4. Create environment file
cp /var/www/elysia-kit/shared/.env.example /var/www/elysia-kit/shared/.env
nano /var/www/elysia-kit/shared/.env
```

### 3. Deploy from Local Machine

**Option A: Using PM2 Deploy (Recommended)**

```bash
# Set your VPS details
export DEPLOY_HOST=your-vps-ip
export DEPLOY_USER=deploy
export DEPLOY_REPO=git@github.com:your-username/elysia-kit.git

# First time: setup deployment directory
pm2 deploy ecosystem.config.cjs production setup

# Deploy
pm2 deploy ecosystem.config.cjs production
```

**Option B: Manual SSH Deploy**

```bash
ssh deploy@your-vps-ip
cd /var/www/elysia-kit
./deploy/pm2/deploy.sh
```

## Environment Variables

Create `/var/www/elysia-kit/shared/.env` on your VPS:

```env
# Application
NODE_ENV=production
APP_PORT=3000
APP_NAME=elysia-kit
APP_URL=https://your-domain.com
LOG_LEVEL=info

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/elysia_kit

# Email (Resend)
RESEND_API_KEY=re_xxxxx
RESEND_MAIL=noreply@your-domain.com

# Trigger.dev (optional)
TRIGGER_SECRET_KEY=tr_xxxxx
TRIGGER_PROJECT_ID=your-project-id
```

## PM2 Commands Reference

| Command | Description |
|---------|-------------|
| `pm2 list` | List all running processes |
| `pm2 logs elysia-kit` | View application logs |
| `pm2 logs elysia-kit --lines 100` | View last 100 log lines |
| `pm2 monit` | Real-time monitoring dashboard |
| `pm2 reload elysia-kit` | Zero-downtime reload |
| `pm2 restart elysia-kit` | Hard restart |
| `pm2 stop elysia-kit` | Stop application |
| `pm2 delete elysia-kit` | Remove from PM2 |
| `pm2 save` | Save current process list |
| `pm2 startup` | Generate startup script |

## Nginx Configuration

The default Nginx config is at `/etc/nginx/sites-available/elysia-kit`.

### Enable HTTPS

After running certbot, uncomment the HTTPS server block:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    # ... rest of config
}
```

### Redirect HTTP to HTTPS

In the HTTP server block, replace the location block with:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## Database Setup

### Using External Database (Recommended for Production)

Use a managed PostgreSQL service:
- [Neon](https://neon.tech) (free tier available)
- [Supabase](https://supabase.com) (free tier available)
- [Railway](https://railway.app)
- [DigitalOcean Managed Databases](https://www.digitalocean.com/products/managed-databases)

### Using Local PostgreSQL

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE USER elysia WITH PASSWORD 'your-password';
CREATE DATABASE elysia_kit OWNER elysia;
\q

# Run migrations
cd /var/www/elysia-kit/current
DATABASE_URL="postgresql://elysia:your-password@localhost:5432/elysia_kit" bun run db:migrate
```

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup SSH
        uses: webfactory/ssh-agent@v0.8.0
        with:
          ssh-private-key: ${{ secrets.DEPLOY_SSH_KEY }}
      
      - name: Add known hosts
        run: ssh-keyscan ${{ secrets.DEPLOY_HOST }} >> ~/.ssh/known_hosts
      
      - name: Install PM2
        run: npm install -g pm2
      
      - name: Deploy
        env:
          DEPLOY_HOST: ${{ secrets.DEPLOY_HOST }}
          DEPLOY_USER: deploy
        run: pm2 deploy ecosystem.config.cjs production
```

Required secrets:
- `DEPLOY_SSH_KEY`: Private SSH key for deploy user
- `DEPLOY_HOST`: Your VPS IP address

## Troubleshooting

### App won't start

```bash
# Check logs
pm2 logs elysia-kit --lines 100

# Check if port is in use
sudo lsof -i :3000

# Verify .env exists and is symlinked
ls -la /var/www/elysia-kit/current/.env
```

### Nginx 502 Bad Gateway

```bash
# Check if app is running
pm2 list

# Check app is listening on correct port
curl http://localhost:3000

# Check nginx error log
sudo tail -f /var/log/nginx/error.log
```

### SSL Certificate Issues

```bash
# Renew certificate
sudo certbot renew --dry-run

# Check certificate status
sudo certbot certificates
```

### Memory Issues

```bash
# Check memory usage
pm2 monit

# Increase max memory in ecosystem.config.cjs
# max_memory_restart: '2G'

# Reduce cluster instances
# instances: 2
```

## Comparison: PM2 vs Pulumi/K8s

| Feature | PM2 | Pulumi/K8s |
|---------|-----|------------|
| **Complexity** | Low | High |
| **Cost** | ~$5/month VPS | ~$20+/month (K3s VPS) |
| **Scaling** | Vertical + cluster mode | Horizontal replicas |
| **Observability** | Basic PM2 logs | Full stack (Prometheus, Grafana, Loki, Tempo) |
| **Zero-downtime deploys** | Yes (`pm2 reload`) | Yes (rolling updates) |
| **SSL** | Certbot/Nginx | cert-manager (automatic) |
| **Load balancing** | Nginx | Kubernetes Service |
| **Best for** | Simple apps, solo devs | Production apps, teams |

Choose PM2 when you want simplicity. Choose Pulumi/K8s when you need full observability and horizontal scaling.
