/**
 * PM2 Ecosystem Configuration for elysia-kit
 * 
 * IMPORTANT: This config is optimized for Bun runtime compatibility.
 * 
 * Bun + PM2 Notes:
 * - Uses 'fork' mode instead of 'cluster' (Bun has issues with PM2 cluster)
 * - interpreter_args '--bun' is commented out (causes errors in some PM2 versions)
 * - wait_ready is disabled for local testing (enable in production if needed)
 * 
 * Local Testing:
 *   pm2 start ecosystem.config.cjs
 *   pm2 logs elysia-kit
 * 
 * Production:
 *   pm2 start ecosystem.config.cjs --env production
 * 
 * Deployment:
 *   pm2 deploy ecosystem.config.cjs production setup  (first time)
 *   pm2 deploy ecosystem.config.cjs production        (subsequent deploys)
 */
module.exports = {
    apps: [
        {
            name: 'elysia-kit',
            script: 'src/index.ts',
            interpreter: 'bun',
            // interpreter_args '--bun' is disabled - causes issues with PM2
            // If you need it for production, test thoroughly first
            // interpreter_args: '--bun',
            instances: 2,              // Local: 2 instances | Production: change to 'max'
            exec_mode: 'fork',         // Fork mode (Bun doesn't work well with cluster)
            watch: false,              // Set to true for development auto-reload
            max_memory_restart: '1G',  // Auto-restart if memory exceeds 1GB

            // Environment variables (defaults for development)
            env: {
                NODE_ENV: 'development',
                APP_PORT: 3000,
                APP_NAME: 'elysia-kit',
                APP_URL: 'http://localhost:3000',
                LOG_LEVEL: 'debug',
            },

            // Production environment overrides
            env_production: {
                NODE_ENV: 'production',
                APP_PORT: 3000,
                LOG_LEVEL: 'info',
                // These should be set via .env file or PM2 ecosystem secrets
                // APP_URL: 'https://your-domain.com',
                // DATABASE_URL: 'postgresql://...',
                // RESEND_API_KEY: '...',
                // RESEND_MAIL: '...',
                // TRIGGER_SECRET_KEY: '...',
                // TRIGGER_PROJECT_ID: '...',
            },

            // Logging
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            error_file: './logs/error.log',
            out_file: './logs/out.log',
            merge_logs: true,

            // Restart strategy
            autorestart: true,
            max_restarts: 10,
            restart_delay: 1000,
            exp_backoff_restart_delay: 100,

            // Graceful shutdown settings
            kill_timeout: 5000,        // Wait 5s for graceful shutdown
            // wait_ready: true,       // Disabled for local testing (app must signal ready)
            // listen_timeout: 10000,  // Enable in production for health checks
        },
    ],

    /**
     * PM2 Deployment Configuration
     * 
     * Setup (first time):
     *   pm2 deploy ecosystem.config.cjs production setup
     * 
     * Deploy:
     *   pm2 deploy ecosystem.config.cjs production
     */
    deploy: {
        production: {
            // SSH connection
            user: process.env.DEPLOY_USER || 'deploy',
            host: process.env.DEPLOY_HOST || 'your-vps-ip',
            key: process.env.DEPLOY_KEY || '~/.ssh/id_rsa',

            // Repository
            ref: 'origin/main',
            repo: process.env.DEPLOY_REPO || 'git@github.com:your-username/elysia-kit.git',
            path: '/var/www/elysia-kit',

            // Post-deploy commands
            'pre-deploy-local': '',
            'post-deploy': 'bun install && pm2 reload ecosystem.config.cjs --env production',
            'pre-setup': '',
            'post-setup': '',

            // Environment file (will be sourced)
            env: {
                NODE_ENV: 'production',
            },
        },

        staging: {
            user: process.env.DEPLOY_USER || 'deploy',
            host: process.env.STAGING_HOST || 'your-staging-ip',
            key: process.env.DEPLOY_KEY || '~/.ssh/id_rsa',
            ref: 'origin/develop',
            repo: process.env.DEPLOY_REPO || 'git@github.com:your-username/elysia-kit.git',
            path: '/var/www/elysia-kit-staging',
            'post-deploy': 'bun install && pm2 reload ecosystem.config.cjs --env staging',
            env: {
                NODE_ENV: 'staging',
            },
        },
    },
};
