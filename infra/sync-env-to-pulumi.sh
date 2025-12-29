#!/bin/bash
# Script to set Pulumi config values from .env file
# Usage: ./sync-env-to-pulumi.sh [stack-name]
#
# This script reads values from ../.env and sets them in Pulumi config
# Secrets are automatically marked as --secret

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/../.env"
STACK="${1:-dev}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔧 Syncing .env to Pulumi config for stack: ${STACK}${NC}"

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ Error: .env file not found at ${ENV_FILE}${NC}"
    echo "Please create a .env file in the project root with the required values."
    exit 1
fi

# Select the stack
cd "$SCRIPT_DIR"
pulumi stack select "$STACK" 2>/dev/null || {
    echo -e "${YELLOW}Stack '$STACK' not found. Creating it...${NC}"
    pulumi stack init "$STACK"
}

# Function to get value from .env file
get_env_value() {
    local key=$1
    grep "^${key}=" "$ENV_FILE" 2>/dev/null | cut -d'=' -f2- | sed 's/^"//' | sed 's/"$//' | sed "s/^'//" | sed "s/'$//"
}

# Function to set pulumi config
set_config() {
    local key=$1
    local value=$2
    local is_secret=${3:-false}
    
    if [ -n "$value" ]; then
        if [ "$is_secret" = "true" ]; then
            echo -e "  Setting ${YELLOW}${key}${NC} (secret)"
            pulumi config set --secret "$key" "$value"
        else
            echo -e "  Setting ${GREEN}${key}${NC}"
            pulumi config set "$key" "$value"
        fi
    else
        echo -e "  ${RED}Skipping ${key} (not found in .env)${NC}"
    fi
}

echo ""
echo "📋 Reading values from .env..."
echo ""

# Non-secret config values
echo "🔓 Setting non-secret config values:"
set_config "imageRegistry" "$(get_env_value 'IMAGE_REGISTRY')"
set_config "imageTag" "$(get_env_value 'IMAGE_TAG')"
set_config "domain" "$(get_env_value 'APP_DOMAIN')"
set_config "letsencryptEmail" "$(get_env_value 'LETSENCRYPT_EMAIL')"
set_config "logLevel" "$(get_env_value 'LOG_LEVEL')"
set_config "replicas" "$(get_env_value 'REPLICAS')"
set_config "dbName" "$(get_env_value 'DB_NAME')"
set_config "dbUser" "$(get_env_value 'DB_USER')"
set_config "dbStorageSize" "$(get_env_value 'DB_STORAGE_SIZE')"
set_config "resendMail" "$(get_env_value 'RESEND_MAIL')"
set_config "triggerProjectId" "$(get_env_value 'TRIGGER_PROJECT_ID')"

echo ""
echo "🔐 Setting secret config values:"
set_config "dbPassword" "$(get_env_value 'DB_PASSWORD')" true
set_config "resendApiKey" "$(get_env_value 'RESEND_API_KEY')" true
set_config "triggerSecretKey" "$(get_env_value 'TRIGGER_SECRET_KEY')" true

echo ""
echo -e "${GREEN}✅ Pulumi config sync complete!${NC}"
echo ""
echo "📝 Current config for stack '$STACK':"
pulumi config

echo ""
echo -e "${YELLOW}💡 Tip: You can now deploy with: pulumi up${NC}"
