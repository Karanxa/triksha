# Use Node.js LTS (Long Term Support) version
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install system dependencies including git for potential package dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install bun for faster package installation (optional but recommended)
RUN curl -fsSL https://bun.sh/install | bash

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

# Expose the port the app runs on
EXPOSE 5173

# Set environment variables with default values
ENV VITE_SUPABASE_URL=your_supabase_url
ENV VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
ENV VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Command to run the application
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]