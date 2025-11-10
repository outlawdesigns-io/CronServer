
# CronMonitor REST API

## Preamble

`CronMonitor` provides a solution for keeping track of [cron](https://www.man7.org/linux/man-pages/man8/cron.8.html) jobs across any number of remote hosts. This API provides an interface for configured hosts to report execution results, as well as for client applications to register new jobs and inspect execution schedules and histories. See [CronClient-VueJS](https://github.com/outlawstar4761/CronClient-VueJS) for an example client application.

## Meta

### Security

This API is accessible only by registered users of [outlawdesigns.io](https://outlawdesigns.io) who present a valid Oauth2 access token.

#### Sample Token Acquisition
```
curl --location --request POST 'https://auth.outlawdesigns.io/oauth2/token' \
--form 'grant_type="client_credentials"' \
--form 'client_id="$CLIENT_ID"' \
--form 'client_secret="CLIENT_SECRET"' \
--form 'audience="https://cronservice.outlawdesigns.io"' \
--form 'scope="openid, profile, email, roles"'
```

### Reporting performance or availability problems

Report performance/availability at our [support site](mailto:j.watson@outlawdesigns.io).

### Reporting bugs, requesting features

Please report bugs with the API or the documentation on our [issue tracker](https://github.com/outlawstar4761/CronMonitor).

## Setup

For any host whose jobs one wants to track using this service, user should first:
 1. Install [cronWrapper.sh](https://gist.github.com/outlawstar4761/a1105f79ba4cd26916abce8a0f3bb139)
 2. Create a `creds` directory containing `{jobId}.env` files containing
    * `CRON_WRAPPER_CLIENT_ID={CLIENT_ID}`
    *  `CRON_WRAPPER_CLIENT_SECRET={CLIENT_SECRET}`
 4. Register a job with the server
 5. Configure `crontab` appropriately
    * Template: `{cronTime} {cronWrapperPath}cronWrapper.sh {jobId} "{cmdToExec}" "{outfile}"`
    * Example: `*/1 * * * * /opt/scripts/cronWrapper.sh 1 "(time /backup.sh)" "/tmp/backup"`

## Endpoints

### job/

* [GetAllJob](./docs/getAllJob.md)
* [GetJob](./docs/getJob.md)
* [CreateJob](./docs/createJob.md)
* [UpdateJob](./docs/updateJob.md)
* [DeleteJob](./docs/deleteJob.md)
* [GetAverageExecutionTime](./docs/getJobAverageExecution.md)

### execution/

* [GetAllExecution](./docs/getAllExecution.md)
* [GetExecution](./docs/getExecution.md)
* [CreateExecution](./docs/createExecution.md)
* [UpdateExecution](./docs/updateExecution.md)
* [DeleteExecution](./docs/deleteExecution.md)

### last/

* [GetJobLastExecution](./docs/getJobLastExecution.md)

### next/

* [GetNextExecutionByCronPattern](./docs/getNextExecutionByCronPattern.md)
* [GetNextExecutionByJobId](./docs/getNextExecutionByJobId.md)

### build/

* [BuildHostCronFile](buildHostCronFile.md)

## Deployment

This package can be deployed in three different modes (`development`,`testing`,`production`). Data sources, ports, authentication endpoints, and certificate paths for each mode are set in `./config.js`.

### Development

Building in `development` mode strips out the need for authentication and downgrades from `https` to `http`. Service will respond to unauthenticated requests and ignore any provided certificates.

### Testing

Used for performing unit tests. When performing these tests, each model will truncate its data source on completion. Ensure that `./config.js`'s `testing` object's `DB_DB` property it distinct from the other two, **or data will be lost** when tests are executed.

### Production

Building in `production` mode will enforce authentication requirements. Service will **not** respond to unauthenticated requests and `https` elevation is expected to be handled by a reverse-proxy.

### Sample build command
```
docker build -t cronserver-expressjs:production .
```
### Sample YAML entry

```
services:
  backend:
    image: cronserver-expressjs
    environment:
      NODE_ENV: production
      MYSQL_HOST: localhost
      MYSQL_USER: root
      MYSQL_PASS: example
      MYSQL_CRON_DB: cron_test
      AUTH_DISCOVERY_URI: https://auth.outlawdesigns.io/.well-known/openid-configuration
      AUTH_CLIENT_ID: cronsuite-server
      AUTH_CLIENT_AUDIENCE: https://cronservice.outlawdesigns.io
      TZ: America/Chicago
    build:
      context: ./
      dockerfile: ./Dockerfile
    ports:
      - '9550:9550'
```
