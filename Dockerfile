FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN mkdir -p /app/data /app/backups

ENV PORT=80

EXPOSE 80 6061

CMD ["npm", "start"]