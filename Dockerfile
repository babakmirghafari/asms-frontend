# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY .npmrc package*.json ./
ARG NODE_AUTH_TOKEN
ENV NODE_AUTH_TOKEN=${NODE_AUTH_TOKEN}
RUN npm ci
COPY . .
RUN npm run build:prod

# Stage 2: Serve
FROM nginx:stable-alpine AS runtime
COPY --from=builder /app/dist/asms-frontend/browser /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s \
  CMD wget -qO- http://localhost:80/health || exit 1
