# syntax=docker/dockerfile:1
# ============================================================
# PackTrack - Deploy en Render.com (contenedor combinado)
# Nginx sirve el frontend Vue y hace proxy /api/ al backend NestJS
# ============================================================

# ---- Etapa 1: Build del frontend Vue ----
FROM node:20 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
ARG VITE_API_BASE_URL=/api/
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# ---- Etapa 2: Compilación del backend NestJS ----
FROM node:20 AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

# ---- Etapa 3: Runtime combinado (Nginx + Node) ----
FROM node:20-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    gettext-base \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Backend compilado + dependencias
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/package.json ./backend/package.json

# Frontend estático servido por nginx
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Config de nginx + script de arranque
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY start.sh /start.sh
RUN chmod +x /start.sh && mkdir -p /app/backend/data

EXPOSE 3000

CMD ["/start.sh"]
