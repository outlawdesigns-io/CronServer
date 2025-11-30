#Pinned to node:20 to ensure armv7 support
FROM node:20-bullseye
WORKDIR /usr/src/app/
RUN mkdir /log
COPY . .
RUN npm install
EXPOSE 80
CMD ["/bin/sh","-c","npm start > /log/cron-api.log"]
