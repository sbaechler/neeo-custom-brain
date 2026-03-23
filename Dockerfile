# Stage 1: Build the Svelte Frontend
FROM oven/bun:1 AS builder
WORKDIR /app
COPY frontend/package.json frontend/bun.lockb* ./frontend/
RUN cd frontend && bun install --frozen-lockfile || bun install
COPY frontend ./frontend/
RUN cd frontend && bun run build

# Stage 2: Serve the backend and static files
FROM oven/bun:1
WORKDIR /app
# We need bonjour-service so we install backend dependencies
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile || bun install

# Copy backend code
COPY server.ts ./

# Copy built frontend
COPY --from=builder /app/frontend/dist ./frontend/dist

# Expose the ports NEEO expects
EXPOSE 3000
EXPOSE 3200

# Start the Bun server
CMD ["bun", "run", "server.ts"]
