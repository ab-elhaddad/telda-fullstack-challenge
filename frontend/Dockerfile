FROM node:22-alpine as build

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

COPY . .

WORKDIR /app

EXPOSE 3000

# Start the app using serve
CMD ["pnpm", "run", "dev"]
