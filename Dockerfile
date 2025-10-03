FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --omit=dev

COPY src ./src
COPY bin ./bin
COPY theme ./theme
COPY nodes ./nodes
COPY var ./var

ENV NODE_ENV=production
EXPOSE 1880

CMD ["npm", "start"]
