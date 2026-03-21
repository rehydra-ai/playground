# Source: https://nuxtjs.org/deployments/koyeb#dockerize-your-application
FROM node:lts AS builder

RUN corepack enable && corepack prepare pnpm@10.26.1 --activate

WORKDIR /app

COPY . .

# .npmrc is excluded from zwrm uploads (dotfiles ignored), so inline its settings
RUN echo "shamefully-hoist=true" > .npmrc

RUN pnpm install --frozen-lockfile

RUN pnpm build

FROM node:lts

WORKDIR /app

COPY --from=builder /app .

ENV HOST 0.0.0.0
ENV PORT 8080

# Source: https://nuxt.com/docs/getting-started/deployment#entry-point
CMD ["node", ".output/server/index.mjs"]
