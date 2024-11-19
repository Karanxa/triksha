# Build Stage
FROM python:3.10-slim AS builder

WORKDIR /app

# Install system dependencies and development tools
RUN apt-get update && apt-get install -y \
    git \
    curl \
    build-essential \
    python3-dev \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install bun
RUN curl -fsSL https://bun.sh/install | bash

# Create and activate virtual environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies
COPY package*.json ./
COPY bun.lockb ./

# Install dependencies using bun
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
FROM python:3.10-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python packages
RUN pip install --upgrade pip && \
    pip install wheel setuptools && \
    pip install numpy==1.23.5 && \
    pip install torch==2.1.0+cpu torchvision==0.16.0+cpu --index-url https://download.pytorch.org/whl/cpu && \
    pip install garak==0.10.0 prompt-security-fuzzer

# Copy nginx configuration and built assets
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

# Create directories for outputs
RUN mkdir -p /app/garak-results /app/fuzzer-results && \
    chmod 777 /app/garak-results /app/fuzzer-results

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]