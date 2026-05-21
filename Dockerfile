# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests first (layer cache)
COPY package.json package-lock.json .npmrc ./

# Install dependencies (requires GITHUB_TOKEN for @babakmirghafari scope)
ARG GITHUB_TOKEN
RUN echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> .npmrc && \
    npm ci --ignore-scripts

# Copy source
COPY . .

# Build production bundle
RUN npm run build:prod

# ─── Stage 2: Serve ───────────────────────────────────────────────────────────
FROM nginx:alpine AS runtime

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built Angular app
COPY --from=builder /app/dist/asms-frontend/browser /usr/share/nginx/html

# Copy nginx template (envsubst replaces ${API_BASE_URL} at container start)
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80

# nginx official image runs envsubst and starts nginx automatically via /docker-entrypoint.d/
CMD ["nginx", "-g", "daemon off;"]
