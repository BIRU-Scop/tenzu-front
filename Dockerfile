# Step 1: Build the dev environment
ARG NODE_VERSION=20
FROM node:${NODE_VERSION} AS dev-env
WORKDIR /app
COPY package*.json ./
RUN npm install --force
COPY --chown=node:node . .

# Step 2: Build the production environment
FROM dev-env AS builder
ENV NODE_ENV production
## app args (don't put any quotes because quotes are already present in the environment file)
ARG RELEASE_VERSION

WORKDIR /app
## replace args in environment file
RUN apt-get update && apt-get install -y gettext-base && rm -rf /var/lib/apt/lists/*
RUN envsubst < src/environments/environment.production.ts > res.txt && \
mv res.txt src/environments/environment.production.ts
## build the app in configuration passed
RUN npx npm run build:production

# Step 3: Serve the app with Caddy
FROM caddy:2-alpine
## app args (don't put any quotes because quotes are already present in the environment file)
ARG RELEASE_VERSION
ARG APP="tenzu"
COPY --from=builder /app/dist/${APP}/browser/ /usr/share/caddy
COPY ./Caddyfile /etc/caddy/Caddyfile
EXPOSE 80
