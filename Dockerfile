# Stage 1: Dependency Installation ('deps')
# We now fortify the Alpine environment with the necessary build tools.
FROM node:18-alpine AS deps
WORKDIR /app

# Install build tools required for compiling native Node.js addons
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
RUN npm install

# Stage 2: Build the Application ('builder')
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Production Image ('runner')
# This final stage remains lean because the build tools are not copied over.
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 5000

CMD ["npm", "start"]