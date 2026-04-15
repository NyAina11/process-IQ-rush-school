# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the NestJS app
# Note: Since api/ is a subdirectory, we point tsconfig and main accordingly
RUN npx tsc -p api/tsconfig.json

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy built files and dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/api/src ./api/src
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/tsconfig.json ./

# Add any necessary env file or let docker-compose handle it
EXPOSE 8001

# Start the NestJS backend
CMD ["node", "-r", "ts-node/register", "api/src/main.ts"]
