# Source: https://nuxtjs.org/deployments/koyeb#dockerize-your-application
FROM node:lts as builder

RUN npm install -g pnpm

WORKDIR /app

COPY . .

RUN pnpm install --frozen-lockfile

RUN pnpm build

FROM node:lts

WORKDIR /app

COPY --from=builder /app .

ENV HOST 0.0.0.0
ENV PORT 8080

# Source: https://nuxt.com/docs/getting-started/deployment#entry-point
CMD ["node", ".output/server/index.mjs"]
