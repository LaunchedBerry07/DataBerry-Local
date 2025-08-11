# Stage 1: Dependency Installation ('deps')
# We now use the standard node:18 image which includes build tools by default.
FROM node:18 AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

# Stage 2: Build the Application ('builder')
# This stage also uses the standard node:18 image.
FROM node:18 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Production Image ('runner')
# For our final stage, we will switch back to the lean Alpine image for a small footprint.
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy only the necessary built assets and production dependencies.
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 5000

CMD ["npm", "start"]