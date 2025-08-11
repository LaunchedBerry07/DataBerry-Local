# This is our final, lean production image.
FROM node:18-alpine

WORKDIR /app

# Set the environment to production.
ENV NODE_ENV=production

# Copy the pre-built 'dist' directory, the production 'node_modules', and package.json.
# These artifacts MUST exist from running 'npm run build' locally first.
COPY dist ./dist
COPY node_modules ./node_modules
COPY package.json ./package.json

# Expose the port the application will run on.
EXPOSE 5000

# The command to start the pre-compiled server.
CMD ["npm", "start"]