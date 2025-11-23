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
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application with tsx (runs TypeScript directly)
CMD ["npx", "tsx", "src/index.ts"]
