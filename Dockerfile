# Stage 1: Build the Vue.js application
FROM node:14.17.0-alpine as build-stage
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Stage 2: Serve the Vue.js application with Nginx
FROM nginx:1.21.0-alpine
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
