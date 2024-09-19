FROM gcr.io/distroless/nodejs22-debian12
COPY . /usr/src/app
WORKDIR /usr/src/app
CMD ["index.js"]
