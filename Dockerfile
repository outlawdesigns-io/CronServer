FROM node:latest
WORKDIR /usr/src/app/
ENV TZ=America/Chicago
ENV NODE_ENV=production
RUN mkdir -p /mnt/LOE/log
RUN mkdir -p /etc/apache2/certs/
COPY . .
RUN npm install
EXPOSE 9550
CMD ["/bin/sh","-c","npm start > /mnt/LOE/log/cram.api.log"]
