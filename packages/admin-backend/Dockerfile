# Development Dockerfile for Admin Backend
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies for better caching
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3002

# Development command with nodemon
CMD ["npm", "run", "dev"] 