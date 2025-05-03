process.env.NODE_ENV = process.env.NODE_ENV || 'development';
//configure SDK db connection
process.env.MYSQL_HOST = process.env.MYSQL_HOST || 'localhost';
process.env.MYSQL_USER = process.env.MYSQL_USER || 'root';
process.env.MYSQL_PASS = process.env.MYSQL_PASS || 'example';
process.env.MYSQL_CRON_DB = process.env.MYSQL_CRON_DB || 'cron_test';
//allows for parameterless init of authClient in ./src/cronServer
process.env.OD_ACCOUNTS_BASE_URL = process.env.OD_ACCOUNTS_BASE_URL || 'https://localhost:9661';

export default {
  development:{
    PORT:9550,
    SSLCERTPATH:'/etc/apache2/certs/fullchain.pem',
    SSLKEYPATH:'/etc/apache2/certs/privkey.pem',
  },
  testing:{
    PORT:9550,
    SSLCERTPATH:'/etc/apache2/certs/fullchain.pem',
    SSLKEYPATH:'/etc/apache2/certs/privkey.pem',
  },
  production:{
    PORT:9550,
    SSLCERTPATH:'/etc/apache2/certs/fullchain.pem',
    SSLKEYPATH:'/etc/apache2/certs/privkey.pem',
  }
};
