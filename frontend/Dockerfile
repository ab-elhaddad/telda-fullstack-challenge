FROM node:18-alpine as build

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

COPY . .
RUN pnpm run build

# Production environment - using Node to serve files
FROM node:18-alpine

WORKDIR /app

# Install serve to run the application
RUN npm install -g serve

# Copy built files from build stage
COPY --from=build /app/dist /app/dist

EXPOSE 3000

# Start the app using serve
CMD ["serve", "-s", "dist", "-l", "3000"]
