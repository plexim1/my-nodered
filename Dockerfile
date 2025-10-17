FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --omit=dev

COPY src ./src
COPY bin ./bin
COPY theme ./theme
COPY nodes ./nodes
COPY var ./var

# Pre-install userDir (var/) function modules so the Function node Setup tab
# can suggest them even before first deploy
RUN npm install --prefix ./var --omit=dev || true

ENV NODE_ENV=production
EXPOSE 1880

CMD ["npm", "start"]
