# Multi-stage build for admin-ui
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY lerna.json ./
COPY packages/shared-types/package*.json ./packages/shared-types/
COPY packages/admin-ui/package*.json ./packages/admin-ui/

# Copy source code first
COPY packages/shared-types ./packages/shared-types
COPY packages/admin-ui ./packages/admin-ui

# Install all dependencies
RUN npm install

# Install esbuild for alternative build
RUN npm install -g esbuild

# Build shared-types
RUN npm run build:shared

# Build admin-ui with esbuild instead of vite
RUN cd packages/admin-ui && npx esbuild src/main.tsx --bundle --outdir=dist --format=esm --target=es2020 --external:react --external:react-dom

# Production stage with nginx
FROM nginx:alpine AS production

# Copy built files to nginx
COPY --from=builder /app/packages/admin-ui/dist /usr/share/nginx/html

# Copy nginx configuration
COPY packages/admin-ui/nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 