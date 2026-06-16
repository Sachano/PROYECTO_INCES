FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (only production)
RUN npm install --production

# Copy backend files
COPY . .

# Pre-create upload folders
RUN mkdir -p uploads/courses uploads/aulaVirtual

# Expose port
EXPOSE 3002

ENV PORT=3002
ENV NODE_ENV=production

CMD ["node", "server.js"]
