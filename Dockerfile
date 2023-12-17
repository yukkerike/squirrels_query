FROM gcr.io/distroless/nodejs20-debian12
COPY . /usr/src/app
WORKDIR /usr/src/app
ENV TOKEN=""
CMD ["index.js"]
