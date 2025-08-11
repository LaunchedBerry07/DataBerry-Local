# Stage 1: Dependency Installation ('deps')
# This stage is dedicated solely to installing npm packages.
# It only copies package.json and package-lock.json.
# Docker will cache this layer and only re-run it if these specific files change.
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# We are reverting to a clean npm install, as the 'overrides' in package.json is the more precise solution.
RUN npm install

# Stage 2: Build the Application ('builder')
# This stage builds on the 'deps' stage.
FROM node:18-alpine AS builder
WORKDIR /app
# Copy the pre-installed node_modules from the 'deps' stage. This is instantaneous.
COPY --from=deps /app/node_modules ./node_modules
# Now, copy the rest of the application source code.
COPY . .
# Run the build script. This will only re-run if the application code has changed.
RUN npm run build

# Stage 3: Production Image ('runner')
# This is the final, lean image that will be deployed.
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy the built assets from the 'builder' stage.
COPY --from=builder /app/dist ./dist
# Copy only the production node_modules from the 'builder' stage.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 5000

CMD ["npm", "start"]