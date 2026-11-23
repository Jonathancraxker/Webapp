# ============================================================================
# ETAPA 1: Compilación del Frontend (Vite + React)
# ============================================================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# ============================================================================
# ETAPA 2: Dependencias de Producción del Backend (SQLite + OpenTelemetry)
# ============================================================================
FROM node:20-alpine AS backend-builder
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci --omit=dev

# ============================================================================
# ETAPA 3: Imagen Final Ligera (Alpine Runtime + Zona Horaria México)
# ============================================================================
FROM node:20-alpine
WORKDIR /app

# Configurar zona horaria oficial de México (UTC-6)
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/America/Mexico_City /etc/localtime && \
    echo "America/Mexico_City" > /etc/timezone

# Argumentos inyectados desde GitHub Actions con la versión y commit de Git
ARG APP_VERSION=1.1.1
ARG GIT_SHA=local

ENV NODE_ENV=production
ENV PORT=80
ENV TZ=America/Mexico_City
ENV APP_VERSION=${APP_VERSION}
ENV GIT_SHA=${GIT_SHA}

# Copiar dependencias de backend, código fuente y build de React
COPY --from=backend-builder /app/node_modules ./node_modules
COPY package*.json ./
COPY server.js app.js ./
COPY src ./src
COPY --from=frontend-builder /app/client/dist ./client/dist

RUN mkdir -p /app/data /app/backups

EXPOSE 80 6061

CMD ["npm", "start"]