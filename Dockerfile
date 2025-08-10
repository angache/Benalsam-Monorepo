FROM node:20-alpine

WORKDIR /app

# Copy everything first
COPY . .

# Install dependencies
RUN npm install

# Build shared-types
WORKDIR /app/packages/shared-types
RUN npm run build

# Build admin-backend
WORKDIR /app/packages/admin-backend
RUN npm run build

# Build admin-ui
WORKDIR /app/packages/admin-ui
RUN npm run build

# Build web
WORKDIR /app/packages/web
RUN npm run build

# Create logs directory
RUN mkdir -p /app/logs && chown -R node:node /app/logs

# Switch to non-root user
USER node

# Expose ports
EXPOSE 3002 3003 3004

# Default command
CMD ["npm", "run", "start", "--prefix", "packages/admin-backend"]
