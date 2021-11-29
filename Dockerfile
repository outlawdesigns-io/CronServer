FROM node:latest
WORKDIR /usr/src/app/
ENV TZ=America/Chicago
ENV NODE_ENV=production
RUN curl https://loe.outlawdesigns.io/Documents/LOE_MX/certs/outlawdesigns_wildcard/fullchain.pem > fullchain.pem
RUN curl https://loe.outlawdesigns.io/Documents/LOE_MX/certs/outlawdesigns_wildcard/privkey.pem > privkey.pem
RUN mkdir -p /mnt/LOE/log
COPY . .
RUN npm install
EXPOSE 9550
CMD ["/bin/sh","-c","npm start > /mnt/LOE/log/cram.api.log"]
