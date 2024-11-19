# Build Stage
FROM python:3.10-slim AS builder

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    make \
    g++ \
    bash \
    rustc \
    cargo \
    libblas-dev \
    liblapack-dev \
    gfortran \
    libopenblas-dev \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Install bun for faster builds
RUN curl -fsSL https://bun.sh/install | bash

# Create and activate virtual environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies in correct order
RUN pip install --upgrade pip && \
    pip install numpy==1.23.5 && \
    pip install \
    --no-cache-dir \
    torch==2.1.0+cpu \
    torchvision==0.16.0+cpu \
    --index-url https://download.pytorch.org/whl/cpu \
    && pip install garak==0.10.0 \
    && pip install prompt-security-fuzzer

# Copy package files
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
FROM nginx:1.24-alpine

# Install Python and dependencies
RUN apk add --no-cache \
    python3 \
    py3-pip \
    bash \
    gcc \
    musl-dev \
    python3-dev \
    lapack-dev \
    gfortran \
    openblas-dev \
    py3-numpy \
    && python3 -m venv /opt/venv

ENV PATH="/opt/venv/bin:$PATH"
ENV OPENBLAS_NUM_THREADS=1

# Install PyTorch, Garak and Prompt Fuzzer in correct order
RUN pip install --upgrade pip && \
    pip install numpy==1.23.5 && \
    pip install \
    --no-cache-dir \
    torch==2.1.0+cpu \
    torchvision==0.16.0+cpu \
    --index-url https://download.pytorch.org/whl/cpu \
    && pip install garak==0.10.0 \
    && pip install prompt-security-fuzzer

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Create directories for outputs
RUN mkdir -p /app/garak-results && chmod 777 /app/garak-results
RUN mkdir -p /app/fuzzer-results && chmod 777 /app/fuzzer-results

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]