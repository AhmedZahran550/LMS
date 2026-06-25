# Stage 1: Install dependencies
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY tooling/tsconfig/package.json ./tooling/tsconfig/
RUN pnpm install --frozen-lockfile

# Stage 2: Build the API
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_module[s] ./apps/api/node_modules/
COPY --from=deps /app/packages/shared-types/node_module[s] ./packages/shared-types/node_modules/
COPY . .
RUN pnpm --filter @lms/shared-types build
RUN pnpm --filter @lms/api build

# Stage 3: Production image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared-types ./packages/shared-types
COPY --from=builder /app/apps/api/node_module[s] ./apps/api/node_modules/
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

CMD ["node", "apps/api/dist/main.js"]
