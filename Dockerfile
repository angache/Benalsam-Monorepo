FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-workspace.yaml ./
COPY packages/*/package*.json ./packages/*/

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install

# Copy source code
COPY . .

# Build shared-types
WORKDIR /app/packages/shared-types
RUN pnpm build

# Build admin-backend
WORKDIR /app/packages/admin-backend
RUN pnpm build

# Build admin-ui
WORKDIR /app/packages/admin-ui
RUN pnpm build

# Build web
WORKDIR /app/packages/web
RUN pnpm build

# Create logs directory
RUN mkdir -p /app/logs && chown -R node:node /app/logs

# Switch to non-root user
USER node

# Expose ports
EXPOSE 3002 3003 3004

# Default command
CMD ["pnpm", "--filter", "@benalsam/admin-backend", "start"]
