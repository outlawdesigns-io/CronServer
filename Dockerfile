FROM node:latest
WORKDIR /usr/src/app/
ARG ENV
ENV TZ=America/Chicago
ENV NODE_ENV=$ENV
ENV MYSQL_CRON_DB=$DB
RUN mkdir -p /mnt/LOE/log
RUN mkdir -p /etc/apache2/certs/
RUN echo America/Chicago > /etc/timezone
RUN ln -sf /usr/share/zoneinfo/America/Chicago /etc/localtime
RUN dpkg-reconfigure -f noninteractive tzdata
COPY . .
RUN npm install
EXPOSE 9550
CMD ["/bin/sh","-c","npm start > /mnt/LOE/log/cram.api.log"]
