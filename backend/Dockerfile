# Development Dockerfile
FROM node:22-alpine

# Set NODE_ENV to development
ENV NODE_ENV=development

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies 
RUN pnpm install

# Copy source code
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose API port
EXPOSE 5000

# Start the development server with hot-reloading
CMD ["pnpm", "run", "dev"]
