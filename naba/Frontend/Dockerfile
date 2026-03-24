# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove test files and dependencies from production image
RUN rm -rf src/__tests__/ src/**/*.test.js src/**/*.test.jsx jest.* babylon.config.* .eslintrc* node_modules .coverage coverage htmlcov .pytest* tests/

# Expose port 80
EXPOSE 80

# Install serve to serve the built application
RUN npm install -g serve

# Start the application
CMD ["serve", "-s", "dist", "-l", "80"]
