FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps ./apps
COPY packages ./packages
RUN pnpm install --frozen-lockfile

FROM deps AS build
RUN pnpm --filter @eventio/web build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5175
ENV HOST=0.0.0.0

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=deps /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=deps /app/apps ./apps
COPY --from=deps /app/packages ./packages
COPY --from=build /app/dist ./dist

EXPOSE 5175
CMD ["pnpm", "--filter", "@eventio/web", "start"]
