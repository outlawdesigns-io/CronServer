# CronMonitor REST API

## Preamble

`CronMonitor` provides a solution for keeping track of [cron](https://www.man7.org/linux/man-pages/man8/cron.8.html) jobs across any number of remote hosts. This API provides an interface for configured hosts to report execution results, as well as for client applications to register new jobs and inspect execution schedules and histories. See [CronClient-VueJS](https://github.com/outlawstar4761/CronClient-VueJS) for an example client application.

## Meta

### Security

This API is accessible only by registered users of [outlawdesigns.io](https://outlawdesigns.io) who present a valid authorization token.
Authorization tokens should be presented as a value of the `auth_token` header.

#### Sample Call
```
curl --location --request GET 'https://api.outlawdesigns.io:9500/job/' \
--header 'auth_token: YOUR_TOKEN' \
```

### Reporting performance or availability problems

Report performance/availability at our [support site](mailto:j.watson@outlawdesigns.io).

### Reporting bugs, requesting features

Please report bugs with the API or the documentation on our [issue tracker](https://github.com/outlawstar4761/CronMonitor).

## Setup

For any host whose jobs one wants to track using this service, user should first:
 1. Install [cronWrapper.sh](https://gist.github.com/outlawstar4761/a1105f79ba4cd26916abce8a0f3bb139)
 2. Set `CRON_USER` and `CRON_PASS` environment variables to valid outlawdesigns.io username/password combination
 3. Register a job with the server
 4. Configure `crontab` appropriately
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

Building in `production` mode will enforce authentication requirements and upgrades from `http` to `https`. Service will **not** respond to unauthenticated requests and production certificates must be in place.

### Sample build command
```
docker build -t cronserver-expressjs:production . --build-arg ENV=production
```
### Sample YAML entry

```
  backend:
    image: cronserver-expressjs
    build:
      context: /home/ubuntu/projects/CronMonitor/
      dockerfile: /home/ubuntu/projects/CronMonitor/Dockerfile
      args:
        ENV: development
    ports:
      - '9550:9550'
```
