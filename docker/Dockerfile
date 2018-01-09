FROM  node:8.9-alpine

WORKDIR /app

ARG NPM_TOKEN
COPY package.json package.json

RUN apk add --no-cache make gcc g++ python git bash && \
  npm install --production && \
  rm -f .npmrc && \
  rm -rf ~/.npm && rm -rf ~/.node-gyp && \
  apk del gcc g++ git python make && \
  rm -rf /var/cache/apk/* && \
  rm -rf /usr/local/lib/node_modules/npm/doc/ && \
  rm -rf /usr/local/lib/node_modules/npm/html/ && \
  rm -rf /tmp/*

COPY docker/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

COPY lib/ lib/
COPY test/ test/

EXPOSE 3001
CMD ["node", "server.js" ]
ENTRYPOINT ["/app/entrypoint.sh"]
