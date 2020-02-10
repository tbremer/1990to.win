FROM node:lts-alpine

WORKDIR app

COPY package.json ./
COPY package-lock.json ./
COPY data.json ./
COPY server/ server/

RUN npm install --only=prod

# RUN ls -la
# RUN ls -la server

CMD ["node", "server/index.js"]
