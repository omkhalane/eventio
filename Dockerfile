FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dumb-init for proper process handling
RUN apk add --no-cache dumb-init

# ============================================================================
# Dependencies Stage
# ============================================================================
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps ./apps
COPY packages ./packages
RUN pnpm install --frozen-lockfile --prod

# ============================================================================
# Build Stage
# ============================================================================
FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps ./apps
COPY packages ./packages
RUN pnpm install --frozen-lockfile
RUN pnpm build

# ============================================================================
# Frontend Production Build
# ============================================================================
FROM base AS frontend-build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps ./apps
COPY packages ./packages
RUN pnpm install --frozen-lockfile
WORKDIR /app/apps/web
RUN pnpm build

# ============================================================================
# Final Runtime Stage
# ============================================================================
FROM base AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
ENV LOG_LEVEL=info

# Copy minimal dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./
COPY --from=deps /app/pnpm-lock.yaml ./
COPY --from=deps /app/pnpm-workspace.yaml ./

# Copy application code
COPY --from=build /app/apps ./apps
COPY --from=build /app/packages ./packages

# Copy built assets
COPY --from=frontend-build /app/apps/web/dist ./apps/web/dist

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/healthz', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["/sbin/dumb-init", "--"]

# Expose port
EXPOSE 3000

# Start the appropriate service based on environment
CMD ["node", "--max-old-space-size=2048", "-r", "tsx/cjs", "-e", "require('./apps/api/src/index.ts')"]