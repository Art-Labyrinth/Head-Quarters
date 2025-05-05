# Stage 1: Build the React application
FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve the application with OpenResty
FROM openresty/openresty

COPY --from=builder /app/dist /usr/local/openresty/nginx/html
COPY nginx.conf /usr/local/openresty/nginx/conf/nginx.conf
