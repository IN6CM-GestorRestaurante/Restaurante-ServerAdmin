# Base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install

# Copy application code
COPY . .

# Expose port
EXPOSE 3001

# Start application
CMD ["node", "index.js"]
