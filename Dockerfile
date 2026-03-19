FROM node:20-bookworm-slim AS build

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM node:20-bookworm-slim AS runtime

ENV NODE_ENV=production
ENV PORT=8080

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY server.cjs ./server.cjs
COPY scripts/start-runtime.sh ./scripts/start-runtime.sh

RUN chmod +x ./scripts/start-runtime.sh \
  && chgrp -R 0 /app \
  && chmod -R g=u /app

EXPOSE 8080

CMD ["./scripts/start-runtime.sh"]
