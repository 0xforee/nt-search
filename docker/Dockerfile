# Multi-stage build for React app
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Install git for auto-update functionality (only needed when AUTO_UPDATE=true)
RUN apk add --no-cache git

# Set working directory
WORKDIR /app

# Copy package files (needed for AUTO_UPDATE=true to rebuild at runtime)
COPY package*.json ./

# Install Node.js for auto-update functionality
# NOTE: Node.js is only needed when AUTO_UPDATE=true is set at runtime.
# When AUTO_UPDATE=false (default), Node.js won't be used but is kept in the image
# to support the auto-update feature. If you don't need auto-update, you can create
# a separate Dockerfile without Node.js for a smaller image size.
RUN apk add --no-cache nodejs npm

# Install all dependencies (only used when AUTO_UPDATE=true)
RUN npm ci

# Copy source code (needed for AUTO_UPDATE=true to rebuild at runtime)
COPY . .

# Copy built assets from builder stage (used when AUTO_UPDATE=false or as fallback)
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Copy entrypoint script
COPY docker/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port
EXPOSE 3000

# Health check (nginx:alpine includes wget)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Environment variables for auto-update (runtime)
# These defaults can be overridden by docker-compose environment variables or -e flags
ENV AUTO_UPDATE=true
ENV GIT_REPO_URL=https://github.com/0xforee/nt-search.git
ENV GIT_BRANCH=main

# Use entrypoint script
ENTRYPOINT ["/docker-entrypoint.sh"]
