const express = require('express');
const http = require('https');
const fs = require('fs');
const CronServer = require('./src/cronServer');


global.config = require('./config');
process.env.NODE_ENV = process.env.NODE_ENV || 'development';


/*SETUP THE EXPRESS SERVER*/
const app = express();
app.use(require('morgan')('combined'));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, auth_token, request_token, password");
  res.header("Access-Control-Allow-Methods", "*");
  next();
});

const cronServer = new CronServer();

/*MAP ROUTES*/
app.get('/last/:jobId',cronServer.getLastExecution);
app.get('/execution/:id',cronServer.getExecution);
app.get('/execution',cronServer.getAllExecutions);
app.post('/execution',cronServer.postExecution);
app.get('/job/:id',cronServer.getJob);
app.get('/job',cronServer.getAllJobs);
app.post('/job',cronServer.postJob);


/*START SERVER*/
if(process.env.NODE_ENV !== 'production'){
  app.listen(global.config[process.env.NODE_ENV].PORT,()=>{
    console.log(process.env.NODE_ENV + ' mode listening on port: ' + global.config[process.env.NODE_ENV].PORT);
  });
}else{
  http.createServer({
    key: fs.readFileSync(global.config[process.env.NODE_ENV].SSLKEYPATH),
    cert: fs.readFileSync(global.config[process.env.NODE_ENV].SSLCERTPATH)
  },app).listen(global.config[process.env.NODE_ENV].PORT,()=>{
    console.log(process.env.NODE_ENV + ' mode listening on port: ' + global.config[process.env.NODE_ENV].PORT);
  });
}

/*
keeping track of system wide crons.
Cron service?
 /next/{pattern} || {id}
	return date of next run

#https://api.outlawdesigns.io:9550/next/{jobID || cron pattern}
#https://api.outlawdesigns.io:9550/build/{hostname}
*/
