FROM node:lts
WORKDIR /usr/src/app/
RUN mkdir -p /mnt/LOE/log
COPY . .
RUN npm install
EXPOSE 9550
CMD ["/bin/sh","-c","npm start > /mnt/LOE/log/cram.api.log"]
