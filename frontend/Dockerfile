# syntax=docker/dockerfile:1

# ---- Build stage: compile the Vue app with Vite ----
FROM node:20 AS builder

WORKDIR /app

# Build-time API URL. Override with `--build-arg VITE_API_BASE_URL=...`
# or in docker-compose under build.args.
ARG VITE_API_BASE_URL=http://localhost:3000/api/
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Runtime stage: serve static files with nginx ----
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
