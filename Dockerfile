# Multi-stage Dockerfile for Quimora Full-Stack Monorepo

# --- Stage 1: Build Frontend Assets ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# --- Stage 2: Production Server ---
FROM node:20-alpine AS runner
WORKDIR /app

# Install production dependencies for backend
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

# Copy backend application source
COPY backend/ ./backend/

# Copy compiled frontend production bundle
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

EXPOSE 5000

ENV NODE_ENV=production
CMD ["node", "backend/api/server.js"]
