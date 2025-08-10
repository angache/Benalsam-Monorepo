# Multi-stage Dockerfile for Admin Backend - NPM only
FROM node:20-alpine AS base
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001

# Dependencies stage
FROM base AS deps
COPY package.json ./
COPY packages/*/package.json ./packages/*/
RUN npm install

# Development stage
FROM base AS development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
WORKDIR /app/packages/admin-backend
RUN npm install --ignore-scripts

USER appuser
EXPOSE 3002
CMD ["npm", "run", "dev"]

# Build stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build shared-types first
WORKDIR /app/packages/shared-types
RUN npm run build

# Build the application
WORKDIR /app/packages/admin-backend
RUN npm install
RUN npm run build

# Production stage
FROM base AS production
COPY --from=builder /app/packages/admin-backend/dist ./dist
COPY --from=builder /app/packages/admin-backend/package.json ./package.json
RUN npm install --only=production

USER appuser
EXPOSE 3002
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
