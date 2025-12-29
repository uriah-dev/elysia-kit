#!/bin/bash
# =============================================================================
# PM2 VPS Initial Setup Script
# 
# This script prepares a fresh VPS for PM2 deployments.
# Run this ONCE on your VPS as root or with sudo.
#
# Usage:
#   curl -sSL https://your-repo/deploy/pm2/setup.sh | bash
#   # Or copy this file to your VPS and run: sudo ./setup.sh
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Configuration
DEPLOY_USER="${DEPLOY_USER:-deploy}"
APP_DIR="/var/www/elysia-kit"
NODE_VERSION="22"

log_info "Starting VPS setup for PM2 deployment..."

# =============================================================================
# 1. System Updates
# =============================================================================
log_info "Updating system packages..."
apt-get update && apt-get upgrade -y

# =============================================================================
# 2. Install Required Packages
# =============================================================================
log_info "Installing required packages..."
apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    nginx \
    certbot \
    python3-certbot-nginx \
    unzip

# =============================================================================
# 3. Install Bun
# =============================================================================
if ! command -v bun &> /dev/null; then
    log_info "Installing Bun..."
    curl -fsSL https://bun.sh/install | bash
    export BUN_INSTALL="$HOME/.bun"
    export PATH="$BUN_INSTALL/bin:$PATH"
    
    # Add to profile for future sessions
    echo 'export BUN_INSTALL="$HOME/.bun"' >> /etc/profile.d/bun.sh
    echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> /etc/profile.d/bun.sh
else
    log_info "Bun already installed"
fi

# =============================================================================
# 4. Install PM2
# =============================================================================
# Install Node.js for PM2 (PM2 needs Node even if we run Bun apps)
if ! command -v node &> /dev/null; then
    log_info "Installing Node.js ${NODE_VERSION} for PM2..."
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt-get install -y nodejs
fi

if ! command -v pm2 &> /dev/null; then
    log_info "Installing PM2 globally..."
    npm install -g pm2
else
    log_info "PM2 already installed"
fi

# =============================================================================
# 5. Create Deploy User
# =============================================================================
if ! id "$DEPLOY_USER" &>/dev/null; then
    log_info "Creating deploy user: $DEPLOY_USER"
    useradd -m -s /bin/bash "$DEPLOY_USER"
    
    # Add to sudo group with limited permissions
    echo "$DEPLOY_USER ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart nginx, /usr/bin/pm2 *" >> /etc/sudoers.d/$DEPLOY_USER
    
    # Setup SSH directory
    mkdir -p /home/$DEPLOY_USER/.ssh
    chmod 700 /home/$DEPLOY_USER/.ssh
    touch /home/$DEPLOY_USER/.ssh/authorized_keys
    chmod 600 /home/$DEPLOY_USER/.ssh/authorized_keys
    chown -R $DEPLOY_USER:$DEPLOY_USER /home/$DEPLOY_USER/.ssh
    
    log_warn "Add your SSH public key to /home/$DEPLOY_USER/.ssh/authorized_keys"
else
    log_info "Deploy user $DEPLOY_USER already exists"
fi

# Install bun for deploy user
su - $DEPLOY_USER -c 'curl -fsSL https://bun.sh/install | bash' || true

# =============================================================================
# 6. Create Application Directory
# =============================================================================
log_info "Creating application directory: $APP_DIR"
mkdir -p "$APP_DIR"
mkdir -p "$APP_DIR/logs"
mkdir -p "$APP_DIR/shared"
chown -R $DEPLOY_USER:$DEPLOY_USER "$APP_DIR"

# =============================================================================
# 7. Configure Nginx
# =============================================================================
log_info "Configuring Nginx..."

cat > /etc/nginx/sites-available/elysia-kit << 'NGINX'
# Elysia-Kit Nginx Configuration
# Update server_name with your domain

upstream elysia_backend {
    # PM2 cluster mode handles multiple instances
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect HTTP to HTTPS (uncomment after SSL setup)
    # return 301 https://$server_name$request_uri;
    
    location / {
        proxy_pass http://elysia_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://elysia_backend;
        access_log off;
    }
}

# HTTPS Server (uncomment after running certbot)
# server {
#     listen 443 ssl http2;
#     server_name your-domain.com www.your-domain.com;
#     
#     ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
#     include /etc/letsencrypt/options-ssl-nginx.conf;
#     ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
#     
#     location / {
#         proxy_pass http://elysia_backend;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade $http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host $host;
#         proxy_set_header X-Real-IP $remote_addr;
#         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto $scheme;
#         proxy_cache_bypass $http_upgrade;
#     }
# }
NGINX

# Enable the site
ln -sf /etc/nginx/sites-available/elysia-kit /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload nginx
nginx -t && systemctl reload nginx

# =============================================================================
# 8. Setup PM2 Startup
# =============================================================================
log_info "Configuring PM2 to start on boot..."
su - $DEPLOY_USER -c "pm2 startup systemd -u $DEPLOY_USER --hp /home/$DEPLOY_USER" || true
systemctl enable pm2-$DEPLOY_USER || true

# =============================================================================
# 9. Create Environment File Template
# =============================================================================
log_info "Creating environment file template..."
cat > "$APP_DIR/shared/.env.example" << 'ENV'
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

# Telemetry (optional - for local observability)
# LOKI_URL=http://localhost:3100
# TEMPO_URL=http://localhost:4318
ENV

chown $DEPLOY_USER:$DEPLOY_USER "$APP_DIR/shared/.env.example"

# =============================================================================
# 10. Summary
# =============================================================================
echo ""
log_info "=============================================="
log_info "VPS Setup Complete!"
log_info "=============================================="
echo ""
log_info "Next steps:"
echo "  1. Add your SSH key to /home/$DEPLOY_USER/.ssh/authorized_keys"
echo "  2. Update /etc/nginx/sites-available/elysia-kit with your domain"
echo "  3. Run: certbot --nginx -d your-domain.com"
echo "  4. Copy $APP_DIR/shared/.env.example to $APP_DIR/shared/.env and fill in values"
echo "  5. From your local machine, run:"
echo "     DEPLOY_HOST=your-vps-ip pm2 deploy ecosystem.config.cjs production setup"
echo "     DEPLOY_HOST=your-vps-ip pm2 deploy ecosystem.config.cjs production"
echo ""
log_info "Useful commands:"
echo "  pm2 list                    - List running processes"
echo "  pm2 logs elysia-kit         - View application logs"
echo "  pm2 monit                   - Real-time monitoring"
echo "  pm2 reload elysia-kit       - Zero-downtime reload"
echo ""
