FROM node:current-slim
COPY . /app
WORKDIR /app
ENV TOKEN=""
CMD ["node", "index.js"]
