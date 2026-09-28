FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies including Prisma
RUN npm ci

# Copy source files
COPY tsconfig.json ./
COPY src ./src/

# Generate Prisma Client & compile TypeScript
RUN npx prisma generate
RUN npm run build

# Stage 2: Production Runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built artifacts and Prisma engine from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

EXPOSE 5000

CMD ["node", "dist/server.js"]
