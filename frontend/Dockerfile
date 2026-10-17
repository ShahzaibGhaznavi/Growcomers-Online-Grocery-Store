# Stage 1: Build React application
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG VITE_NODE_API_URL
ARG VITE_PYTHON_API_URL
ENV VITE_NODE_API_URL=${VITE_NODE_API_URL}
ENV VITE_PYTHON_API_URL=${VITE_PYTHON_API_URL}
RUN npm run build


# Stage 2: Serve React application with Nginx
FROM nginx:alpine

# Update Alpine packages to receive available security fixes
RUN apk upgrade --no-cache

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]