# Development Dockerfile for Admin UI
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3003

# Development command with Vite
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"] 