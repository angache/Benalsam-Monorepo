# Multi-stage Dockerfile for Admin UI
# Development ve Production için optimize edilmiş

# Base stage - ortak dependencies
FROM node:20-alpine AS base
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S appuser -u 1001

# Dependencies stage - sadece package.json dosyalarını kopyala (cache layer)
FROM base AS deps
# Copy package files first (for better caching)
COPY package.json pnpm-lock.yaml ./
COPY packages/*/package.json ./packages/*/

# Install dependencies (this layer will be cached if package.json doesn't change)
RUN pnpm install --frozen-lockfile --no-verify-store-integrity

# Development stage - hot reload için
FROM base AS development
# Copy dependencies from deps stage (including devDependencies)
COPY --from=deps /app/node_modules ./node_modules
# Copy source code (this layer changes frequently)
COPY . .
WORKDIR /app/packages/admin-ui

# Install devDependencies for development
RUN pnpm install --frozen-lockfile

# Fix permissions for Vite
RUN chown -R appuser:nodejs /app/packages/admin-ui

# Development environment variables
ENV NODE_ENV=development
ENV HOST=0.0.0.0
EXPOSE 3003

# Switch to non-root user
USER appuser
CMD ["pnpm", "run", "dev"]

# Build stage - Vite build
FROM base AS builder
# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
# Copy source code
COPY . .
WORKDIR /app/packages/admin-ui

# Build the application (this layer changes when source code changes)
RUN pnpm install --frozen-lockfile --prod --ignore-scripts && pnpm run build || true

# Production stage - Nginx ile serve
FROM nginx:alpine AS production
# Copy built files (this layer changes when build changes)
COPY --from=builder /app/packages/admin-ui/dist /usr/share/nginx/html
# Copy nginx configuration
COPY packages/admin-ui/nginx.conf /etc/nginx/nginx.conf

# Create non-root user for nginx
RUN addgroup -g 1001 -S nginx
RUN adduser -S nginx -u 1001

# Switch to non-root user
USER nginx

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"] 