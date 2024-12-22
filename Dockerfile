# Build Stage
FROM node:20-slim AS builder

WORKDIR /app

# Install only the minimal required system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Ensure .env file exists with placeholder values
RUN echo "VITE_SUPABASE_URL=placeholder\nVITE_SUPABASE_ANON_KEY=placeholder" > .env

# Build the application
RUN npm run build

# Production Stage
FROM nginx:alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 5173

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5173/ || exit 1

# Create entrypoint script to handle environment variables
RUN echo '#!/bin/sh\n\
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then\n\
    echo "Error: Supabase environment variables are not set"\n\
    echo "Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"\n\
    exit 1\n\
fi\n\
nginx -g "daemon off;"' > /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh

# Start nginx using the entrypoint script
ENTRYPOINT ["/docker-entrypoint.sh"]