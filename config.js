process.env.NODE_ENV = process.env.NODE_ENV || 'production';
//configure SDK db connection
process.env.MYSQL_HOST = process.env.MYSQL_HOST || 'localhost';
process.env.MYSQL_USER = process.env.MYSQL_USER || 'root';
process.env.MYSQL_PASS = process.env.MYSQL_PASS || 'example';
process.env.MYSQL_CRON_DB = process.env.MYSQL_CRON_DB || 'cron_test';

process.env.AUTH_DISCOVERY_URI = process.env.AUTH_DISCOVERY_URI || 'https://auth.outlawdesigns.io/.well-known/openid-configuration';
process.env.AUTH_CLIENT_ID =  process.env.AUTH_CLIENT_ID || '2ad8ece1-aa86-4e8f-90d2-470d2ef6f862';
process.env.AUTH_CLIENT_AUDIENCE = process.env.AUTH_CLIENT_AUDIENCE || 'https://localhost';
process.env.PORT = process.env.port || 80;
