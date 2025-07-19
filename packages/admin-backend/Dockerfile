# Development Dockerfile for Admin Backend
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy monorepo root files
COPY package*.json ./
COPY lerna.json ./

# Copy shared-types package
COPY packages/shared-types ./packages/shared-types

# Copy admin-backend package
COPY packages/admin-backend ./packages/admin-backend

# Install dependencies
RUN npm install

# Build shared-types first
WORKDIR /app/packages/shared-types
RUN npm run build

# Switch to admin-backend
WORKDIR /app/packages/admin-backend

# Install admin-backend dependencies
RUN npm install

# Expose port
EXPOSE 3002

# Development command with nodemon
CMD ["npm", "run", "dev"] 