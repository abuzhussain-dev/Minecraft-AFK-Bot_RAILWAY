FROM node:18-alpine
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy bot + config
COPY . .

# Hard RAM cap for Node
ENV NODE_OPTIONS="--max-old-space-size=384"

CMD ["node", "bot.js"]
