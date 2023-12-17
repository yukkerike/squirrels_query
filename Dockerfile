FROM gcr.io/distroless/nodejs20-debian12
COPY . /usr/src/app
WORKDIR /usr/src/app
CMD ["index.js"]
