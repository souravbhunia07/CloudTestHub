# Use Node.js 22 as the runtime for the CloudTestHub worker.
FROM node:22-bookworm

# Set the working directory inside the worker container.
WORKDIR /app

# Copy package files first so Docker can cache dependency installation.
COPY package*.json ./

# Install all dependencies required to build and run the worker.
RUN npm install

# Install the Chromium browser required by Playwright.
RUN npx playwright install --with-deps chromium

# Copy the TypeScript source and configuration into the container.
COPY . .

# Compile the CloudTestHub TypeScript backend into JavaScript.
RUN npm run build

# Start the SQS worker when the container launches.
CMD ["node", "dist/src/queue/worker.js"]