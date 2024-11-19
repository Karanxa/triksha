# Build Stage
FROM python:3.9-alpine AS builder

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    make \
    g++ \
    bash \
    rust \
    cargo \
    linux-headers

# Install bun for faster builds
RUN curl -fsSL https://bun.sh/install | bash

# Create and activate virtual environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Upgrade pip first
RUN pip install --upgrade pip

# Install PyTorch with CPU support (using a version known to work with Alpine)
RUN pip install \
    torch==1.8.1+cpu \
    torchvision==0.9.1+cpu \
    -f https://download.pytorch.org/whl/torch_stable.html

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

# Install Python and dependencies
RUN apk add --no-cache \
    python3 \
    py3-pip \
    bash \
    rust \
    cargo \
    linux-headers

# Create and activate virtual environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Upgrade pip
RUN pip install --upgrade pip

# Install PyTorch with CPU support
RUN pip install \
    torch==1.8.1+cpu \
    torchvision==0.9.1+cpu \
    -f https://download.pytorch.org/whl/torch_stable.html

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