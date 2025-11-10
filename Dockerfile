#Pinned to node:20 to ensure armv7 support
FROM node:20-bullseye
WORKDIR /usr/src/app/
RUN mkdir -p /mnt/LOE/log
COPY . .
RUN npm install
EXPOSE 9550
CMD ["/bin/sh","-c","npm start > /mnt/LOE/log/cram.api.log"]
