#!/bin/bash
# =============================================================================
# PM2 Manual Deployment Script
# 
# Alternative to `pm2 deploy` - use this for simple git-pull deployments.
# Run this on your VPS or via SSH.
#
# Usage:
#   ./deploy.sh                    # Deploy with defaults
#   ./deploy.sh --branch develop   # Deploy specific branch
#   ./deploy.sh --migrate          # Run database migrations after deploy
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${BLUE}[STEP]${NC} $1"; }

# Configuration
APP_DIR="${APP_DIR:-/var/www/elysia-kit}"
APP_NAME="elysia-kit"
BRANCH="main"
RUN_MIGRATIONS=false

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --branch) BRANCH="$2"; shift ;;
        --migrate) RUN_MIGRATIONS=true ;;
        -h|--help)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  --branch <name>   Git branch to deploy (default: main)"
            echo "  --migrate         Run database migrations after deploy"
            echo "  -h, --help        Show this help"
            exit 0
            ;;
        *) log_error "Unknown option: $1"; exit 1 ;;
    esac
    shift
done

# =============================================================================
# Pre-flight Checks
# =============================================================================
log_step "Running pre-flight checks..."

if [ ! -d "$APP_DIR" ]; then
    log_error "Application directory not found: $APP_DIR"
    log_info "Run the setup script first or clone your repo manually"
    exit 1
fi

cd "$APP_DIR/current" 2>/dev/null || cd "$APP_DIR"

if [ ! -f "package.json" ]; then
    log_error "package.json not found. Is this the correct directory?"
    exit 1
fi

# Check for .env file
if [ ! -f ".env" ] && [ -f "../shared/.env" ]; then
    log_info "Symlinking .env from shared directory..."
    ln -sf ../shared/.env .env
fi

if [ ! -f ".env" ]; then
    log_warn "No .env file found. Application may fail to start."
fi

# =============================================================================
# Deploy
# =============================================================================
DEPLOY_START=$(date +%s)

log_step "Pulling latest changes from origin/$BRANCH..."
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"

COMMIT_HASH=$(git rev-parse --short HEAD)
COMMIT_MSG=$(git log -1 --pretty=%B | head -n 1)
log_info "Deploying commit: $COMMIT_HASH - $COMMIT_MSG"

log_step "Installing dependencies..."
bun install --frozen-lockfile 2>/dev/null || bun install

# =============================================================================
# Database Migrations (optional)
# =============================================================================
if [ "$RUN_MIGRATIONS" = true ]; then
    log_step "Running database migrations..."
    bun run db:migrate || {
        log_warn "Migration failed or no migrations to run"
    }
fi

# =============================================================================
# Reload Application
# =============================================================================
log_step "Reloading application with PM2..."

# Check if app is already managed by PM2
if pm2 describe "$APP_NAME" > /dev/null 2>&1; then
    log_info "Reloading existing PM2 process..."
    pm2 reload "$APP_NAME" --update-env
else
    log_info "Starting new PM2 process..."
    pm2 start ecosystem.config.cjs --env production
fi

# Save PM2 process list
pm2 save

# =============================================================================
# Health Check
# =============================================================================
log_step "Running health check..."
sleep 3

# Get app port from ecosystem config or default
APP_PORT="${APP_PORT:-3000}"

for i in {1..5}; do
    if curl -sf "http://localhost:$APP_PORT/health" > /dev/null 2>&1 || \
       curl -sf "http://localhost:$APP_PORT" > /dev/null 2>&1; then
        log_info "Health check passed!"
        break
    fi
    
    if [ $i -eq 5 ]; then
        log_warn "Health check failed after 5 attempts"
        log_warn "Check logs with: pm2 logs $APP_NAME"
    else
        log_info "Waiting for app to start... (attempt $i/5)"
        sleep 2
    fi
done

# =============================================================================
# Summary
# =============================================================================
DEPLOY_END=$(date +%s)
DEPLOY_DURATION=$((DEPLOY_END - DEPLOY_START))

echo ""
log_info "=============================================="
log_info "Deployment Complete!"
log_info "=============================================="
echo ""
log_info "  Branch:    $BRANCH"
log_info "  Commit:    $COMMIT_HASH"
log_info "  Duration:  ${DEPLOY_DURATION}s"
log_info "  Time:      $(date)"
echo ""
log_info "PM2 Status:"
pm2 list | grep "$APP_NAME" || pm2 list
echo ""
