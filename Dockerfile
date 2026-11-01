FROM node:24-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --chown=node:node site/ ./site/
RUN mkdir -p /app/data && chown node:node /app/data
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3015
USER node
VOLUME ["/app/data"]
EXPOSE 3015
CMD ["node", "site/server.js"]
