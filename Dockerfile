FROM node:lts AS build

WORKDIR /app
COPY . ./

RUN npm install
RUN npm run build:client

FROM node:lts-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package.json ./
COPY package-lock.json ./
COPY data.json ./
COPY candidate-info.json ./
COPY server/ server/
COPY lib/ lib/
COPY --from=build /app/assets/ assets/

RUN npm install --only=prod

# RUN ls -la
# RUN ls -la server

CMD ["npm", "start"]
