# Use Node.js LTS version
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install system dependencies for Prisma
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies for tsx and typescript)
RUN npm ci && npm cache clean --force

# Copy prisma schema
COPY src/prisma ./src/prisma

# Generate Prisma client
RUN npx prisma generate --schema=./src/prisma/schema.prisma

# Copy source code
COPY . .

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://0.0.0.0:80/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start script that runs migrations then starts the app
RUN printf '#!/bin/sh\nset -e\ncd src/prisma\nnpx prisma db push --accept-data-loss\ncd ../..\nexec npx tsx src/index.ts\n' > /app/start.sh && chmod +x /app/start.sh

# Start the application
CMD ["sh", "/app/start.sh"]

