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
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Install bun (with fallback to npm)
RUN curl -fsSL https://bun.sh/install | bash && \
    echo 'export BUN_INSTALL="$HOME/.bun"' >> $HOME/.bashrc && \
    echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> $HOME/.bashrc

# Create and activate virtual environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy package files
COPY package*.json ./
COPY bun.lockb ./

# Install dependencies (fallback to npm if bun fails)
RUN /root/.bun/bin/bun install || npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Production Stage
FROM nginx:alpine

# Install Python and required packages
RUN apk add --no-cache python3 py3-pip build-base python3-dev

# Create virtual environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python packages with specific versions
RUN pip install --upgrade pip && \
    pip install wheel setuptools && \
    pip install numpy==1.23.5 && \
    pip install torch==2.1.0+cpu torchvision==0.16.0+cpu --index-url https://download.pytorch.org/whl/cpu && \
    pip install openai==1.6.1 && \
    pip install garak==0.10.0 && \
    pip install prompt-security-fuzzer==0.1.7

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Create directories for outputs with proper permissions
RUN mkdir -p /app/garak-results /app/fuzzer-results && \
    chown -R nginx:nginx /app/garak-results /app/fuzzer-results

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]