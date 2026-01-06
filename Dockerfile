# syntax=docker/dockerfile:1

# ---- Build Stage ----
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install production dependencies only
RUN bun install --frozen-lockfile --production

# ---- Production Stage ----
FROM oven/bun:1-alpine AS production

WORKDIR /app

# Copy dependencies and config
COPY --from=builder /app/node_modules ./node_modules
COPY package.json tsconfig.json bunfig.toml ./

# Copy source code
COPY src ./src

# Port configuration (override with -e APP_PORT=8080 at runtime)
ARG APP_PORT=3000
ENV NODE_ENV=production
ENV APP_PORT=${APP_PORT}

# Expose port
EXPOSE ${APP_PORT}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Run TypeScript directly (Bun handles it natively)
CMD ["bun", "run", "src/index.ts"]
