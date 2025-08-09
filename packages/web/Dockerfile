# Multi-stage Dockerfile for Web - NPM only
# Development ve Production için optimize edilmiş

# Base stage - ortak dependencies
FROM node:20-alpine AS base
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S appuser -u 1001

# Dependencies stage - sadece package.json dosyalarını kopyala (cache layer)
FROM base AS deps
# Copy package files first (for better caching)
COPY package.json ./
COPY packages/*/package.json ./packages/*/

# Install dependencies using npm (no pnpm)
RUN npm install

# Development stage - hot reload için
FROM base AS development
# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
# Copy source code
COPY . .
WORKDIR /app/packages/web

# Install devDependencies for development (skip scripts to avoid shared-types build)
RUN npm install --ignore-scripts

# Create temp directory for Vite and set permissions
RUN mkdir -p /tmp/vite && chown -R appuser:nodejs /tmp/vite
RUN chown -R appuser:nodejs /app/packages/web

# Development environment variables
ENV NODE_ENV=development
ENV HOST=0.0.0.0
ENV VITE_CACHE_DIR=/tmp/vite
EXPOSE 3000

# Switch to non-root user
USER appuser
CMD ["npm", "run", "dev"]

# Build stage - React build
FROM base AS builder
# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
# Copy entire monorepo
COPY . .
WORKDIR /app/packages/web

# Install dependencies for this package (skip scripts to avoid shared-types build)
RUN npm install --ignore-scripts

# Build the application
RUN npm run build

# Production stage - nginx ile static serving
FROM nginx:alpine AS production
# Copy nginx configuration
COPY packages/web/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application
COPY --from=builder --chown=nginx:nginx /app/packages/web/dist /usr/share/nginx/html

# Production environment variables
ENV NODE_ENV=production
EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
