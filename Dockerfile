# Stage 1: Build
FROM node:20-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app
COPY package.json yarn.lock ./
COPY prisma ./prisma/
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn prisma generate
RUN yarn build

# Stage 2: Runner
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app
COPY package.json yarn.lock ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

ENV NODE_ENV=production
ENV PORT=10000
EXPOSE 10000

CMD ["sh", "-c", "npx prisma generate && npx prisma db push && node dist/main"]
