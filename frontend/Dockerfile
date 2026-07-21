# ---------- Stage 1: Build ----------
FROM node:20-alpine AS build

WORKDIR /app

# Copy package.json trước để cache layer install
COPY package*.json ./
RUN npm ci

# Copy source và build ra static files (thư mục dist/)
COPY . .
RUN npm run build

# ---------- Stage 2: Serve bằng Nginx ----------
FROM nginx:alpine

# Xoá config mặc định, thay bằng config custom
RUN rm -rf /usr/share/nginx/html/* \
    && rm /etc/nginx/conf.d/default.conf

# Copy static build từ stage 1 sang thư mục Nginx serve
COPY --from=build /app/dist /usr/share/nginx/html

# Copy config Nginx custom
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]