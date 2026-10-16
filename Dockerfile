# syntax=docker/dockerfile:1

# ==================================================
# Stage 1: Build Angular SSR
# ==================================================
FROM node:24-alpine AS builder

# Copy Bun binary for fast dependency installation with bun.lock
COPY --from=oven/bun:1-alpine /usr/local/bin/bun /usr/local/bin/bun

WORKDIR /app

# Copy dependency definition files
COPY package.json bun.lock* ./

# Install dependencies (respect lockfile when present)
RUN bun install --frozen-lockfile || bun install

# Copy source code and configuration files
COPY angular.json tsconfig*.json .postcssrc* ./
COPY src/ ./src/
COPY public/ ./public/

# Build production application bundle (Client + SSR Server) using Node.js
RUN npm run build

# ==================================================
# Stage 2: Minimal Production Runtime with Node 22
# ==================================================
FROM node:24-alpine AS runner

WORKDIR /app

# Set production environment variables
ENV NODE_ENV=production \
    PORT=4000 \
    ALLOWED_HOSTS=*

# Ensure Alpine tools and non-root permissions
# node user (uid 1000, gid 1000) is pre-configured in node:alpine images
RUN mkdir -p /app/dist && chown -R node:node /app

# Copy built artifacts from builder stage
COPY --from=builder --chown=node:node /app/dist/financa ./dist/financa
COPY --from=builder --chown=node:node /app/package.json ./package.json

# Switch to unprivileged user for security
USER node

# Expose port (default 4000)
EXPOSE 4000

# Docker native healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:4000/health || exit 1

# Start Angular Express SSR server
CMD ["node", "dist/financa/server/server.mjs"]
