# Stage 1: Build Angular app
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json  ./
# The .npmrc file will be mounted here as a secret by Docker Compose
# RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm install
ARG HTTP_PROXY
ARG HTTPS_PROXY
ENV http_proxy=${HTTP_PROXY}
ENV https_proxy=${HTTPS_PROXY}
COPY .npmrc ./
RUN npm install

COPY . .
RUN npm run build -- --configuration production

# Stage 2: Serve app with Nginx
FROM nginx:stable-alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built Angular app to nginx web directory
COPY --from=build /app/dist/novus-chat /usr/share/nginx/html

# Copy custom nginx config if needed (optional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy environment configuration files
COPY src/assets/env.*.js /usr/share/nginx/html/assets/

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 4200

# Environment variables for runtime configuration
ENV VM_IP_ADDRESS=""
ENV OPENSHIFT_ROUTE=""
ENV PROTOCOL="http"
ENV API_PORT="9091"
ENV ENVIRONMENT="auto"

ENTRYPOINT ["/entrypoint.sh"]

