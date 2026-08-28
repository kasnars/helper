# syntax=docker/dockerfile:1

FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.15.0 --activate
COPY package.json pnpm-lock.yaml ./
# 当前 package.json 与 pnpm-lock.yaml 存在历史依赖差异，允许 pnpm 在构建时同步锁文件。
RUN pnpm install --no-frozen-lockfile --ignore-scripts
COPY . .
RUN pnpm run build

FROM nginx:1.27-alpine AS runner
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html/helper
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
