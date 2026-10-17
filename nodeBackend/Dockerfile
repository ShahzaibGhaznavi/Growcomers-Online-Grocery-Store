FROM node:20-alpine

WORKDIR /app

# Patch vulnerable Alpine OS packages
RUN apk upgrade --no-cache

COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --omit=dev

COPY . .

# npm and Corepack are build-time tools, not required to run server.js
RUN rm -rf \
    /usr/local/lib/node_modules/npm \
    /usr/local/lib/node_modules/corepack \
    /opt/yarn-v1.22.22

EXPOSE 4000

CMD ["node", "server.js"]
