# Build Stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install system dependencies including Python and Rust
RUN apk add --no-cache git curl python3 py3-pip make g++ bash rust cargo

# Install bun for faster builds
RUN curl -fsSL https://bun.sh/install | bash

# Create and activate virtual environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Upgrade pip first
RUN pip install --upgrade pip

# Install PyTorch 2.1.3 (CPU version) first as it's required by Garak 0.10.0
RUN pip install torch==2.1.3 torchvision==0.16.3 --index-url https://download.pytorch.org/whl/cpu

# Install Garak after PyTorch is installed
RUN pip install garak==0.10.0

# Copy package files
COPY package*.json ./
COPY bun.lockb ./

# Install dependencies using bun (faster) or fallback to npm
RUN if command -v bun >/dev/null 2>&1; then \
    bun install; \
    else \
    npm install; \
    fi

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Production Stage
FROM nginx:alpine

# Install Python, Rust and create virtual environment
RUN apk add --no-cache python3 py3-pip bash rust cargo
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Upgrade pip first
RUN pip install --upgrade pip

# Install PyTorch 2.1.3 (CPU version) first
RUN pip install torch==2.1.3 torchvision==0.16.3 --index-url https://download.pytorch.org/whl/cpu

# Install Garak after PyTorch
RUN pip install garak==0.10.0

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Create a directory for Garak outputs
RUN mkdir -p /app/garak-results && chmod 777 /app/garak-results

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
    CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]