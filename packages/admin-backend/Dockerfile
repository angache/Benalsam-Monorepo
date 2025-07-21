# Stage 1: Builder
FROM node:20-slim AS builder

WORKDIR /app

# Copy package info
COPY package*.json ./
COPY lerna.json ./
COPY packages/shared-types/package*.json ./packages/shared-types/
COPY packages/admin-backend/package*.json ./packages/admin-backend/

# Copy source code first (including tsconfig files)
COPY packages/shared-types ./packages/shared-types
COPY packages/admin-backend ./packages/admin-backend

# Install all deps
RUN npm install

# Build shared-types
RUN npm run build:shared

# Build admin-backend
RUN npm run build --workspace=@benalsam/admin-backend

# Stage 2: Production
FROM node:20-slim AS production

WORKDIR /app

# Copy only admin-backend package.json (NOT monorepo root!)
COPY packages/admin-backend/package.json ./package.json
COPY packages/admin-backend/package-lock.json ./package-lock.json

# Install only production deps first
RUN npm install --omit=dev --ignore-scripts

# Install elasticsearch dependency for shared-types
RUN npm install @elastic/elasticsearch

# Copy built code from builder
COPY --from=builder /app/packages/admin-backend/dist ./dist

# Setup shared-types as local dependency with its own node_modules
COPY --from=builder /app/packages/shared-types/dist ./node_modules/@benalsam/shared-types/dist
COPY --from=builder /app/packages/shared-types/package.json ./node_modules/@benalsam/shared-types/package.json
COPY --from=builder /app/packages/shared-types/node_modules ./node_modules/@benalsam/shared-types/node_modules

# Create symlink for shared-types to work with absolute path
RUN mkdir -p /shared-types && ln -s /app/node_modules/@benalsam/shared-types/dist /shared-types/dist

# Env vars
COPY packages/admin-backend/env.production.local ./.env

EXPOSE 3002

CMD ["node", "dist/index.js"] 