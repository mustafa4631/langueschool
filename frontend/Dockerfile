# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Set production env for build optimizations
ENV NODE_ENV=production

# Define build arguments
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Install dependencies
COPY package*.json ./
RUN npm ci --include=dev

# Build the application
COPY . .
RUN npm run build


# Run stage
FROM node:20-alpine AS runner
WORKDIR /app

# Environment variables for production
ENV NODE_ENV=production

# Copy only what we need to run
COPY --from=builder /app/package.json .
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts . 

EXPOSE 3000

# Start the application
CMD ["npm", "start"]
