FROM node:20-alpine
WORKDIR /app
COPY package.json .
RUN npm install --production
COPY . .
# Thư mục /database sẽ được mount từ docker-compose (dùng cho seeder)
EXPOSE 5000
CMD ["node", "src/server.js"]
