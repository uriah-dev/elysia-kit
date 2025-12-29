# Build stage
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build if needed (add build step here if you have one)
# RUN bun run build

# Production stage
FROM oven/bun:1-slim AS runner

WORKDIR /app

# Create non-root user (using Debian minimal commands)
RUN apt-get update && apt-get install -y --no-install-recommends adduser && rm -rf /var/lib/apt/lists/* && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --gid 1001 elysia

# Copy built application
COPY --from=builder --chown=elysia:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=elysia:nodejs /app/src ./src
COPY --from=builder --chown=elysia:nodejs /app/package.json ./
COPY --from=builder --chown=elysia:nodejs /app/tsconfig.json ./
COPY --from=builder --chown=elysia:nodejs /app/drizzle.config.ts ./

# Switch to non-root user
USER elysia

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD bun --eval "fetch('http://localhost:3000/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Start the application
CMD ["bun", "run", "src/index.ts"]
