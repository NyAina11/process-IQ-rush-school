# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (caching)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the app (React/Vite)
# ARG to pass VITE_BASE_API_URL during build time
ARG VITE_BASE_API_URL=/api
ENV VITE_BASE_API_URL=$VITE_BASE_API_URL
RUN npm run build

# Production stage
FROM nginx:alpine AS runner

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
