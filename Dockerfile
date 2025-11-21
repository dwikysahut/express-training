# Dockerfile untuk Express
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY src ./src
COPY sql ./sql

EXPOSE 3000
# Gunakan entry dari package.json (start) agar mudah diubah
CMD ["npm", "start"]
