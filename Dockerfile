# Stage 1: Dependency Installation ('deps') using pnpm
# We use the standard node:18 image which includes build tools by default.
FROM node:18 AS deps
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy dependency manifests
COPY package.json package-lock.json* ./

# Install dependencies using pnpm. This will be significantly faster.
RUN pnpm install --frozen-lockfile

# Stage 2: Build the Application ('builder')
FROM node:18 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Production Image ('runner')
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# We need to re-install production dependencies using pnpm in the final stage
# to ensure all symbolic links are correct within the lean Alpine environment.
RUN npm install -g pnpm
COPY package.json package-lock.json* ./
RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

EXPOSE 5000

CMD ["npm", "start"]