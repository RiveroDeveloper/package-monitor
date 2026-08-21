#!/bin/bash
set -e

# Render asigna el puerto público en $PORT (default 10000).
# nginx escucha en ese puerto; el backend NestJS escucha internamente en 3000.
export NGINX_PORT="${PORT:-10000}"
echo "==> Puerto público (nginx): $NGINX_PORT"

# Iniciar backend NestJS en 127.0.0.1:3000 (interno, no expuesto)
# AUTH_DISABLED=true deja login/registro deshabilitados para demo.
echo "==> Iniciando backend NestJS en 127.0.0.1:3000..."
cd /app/backend
PORT=3000 AUTH_DISABLED=true node dist/main.js &
BACKEND_PID=$!

# Inyectar ${NGINX_PORT} en el config de nginx
envsubst '${NGINX_PORT}' < /etc/nginx/conf.d/default.conf > /tmp/nginx-render.conf
cp /tmp/nginx-render.conf /etc/nginx/conf.d/default.conf

echo "==> Iniciando Nginx..."
nginx -g 'daemon off;' &

# Si el backend muere, detener el contenedor
wait $BACKEND_PID
