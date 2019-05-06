FROM node:8-alpine AS base
WORKDIR /usr/src/app
COPY package.json package.json
COPY . .

FROM base AS dependencies
RUN apk add --no-cache make gcc g++ python
RUN npm install -q
RUN npm run build

FROM base AS release
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY --from=dependencies /usr/src/app/build ./build
COPY --from=dependencies /usr/src/app/config ./config
RUN rm -f package-lock.json
RUN rm -rf src
CMD ["npm", "start"]