const express = require('express');
const http = require('https');
const fs = require('fs');
const CronServer = require('./src/cronServer');


global.config = require('./config');
process.env.NODE_ENV = process.env.NODE_ENV || 'development';


/*SETUP THE EXPRESS SERVER*/
const app = express();
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, auth_token, request_token, password");
  res.header("Access-Control-Allow-Methods", "*");
  next();
});
if(process.env.NODE_ENV !== 'testing'){
  //app.use(require('morgan')('combined'));
  var morgan = require('morgan');
  morgan.token('date', function() {
    var p = new Date().toString().replace(/[A-Z]{3}\+/,'+').split(/ /);
    return( p[2]+'/'+p[1]+'/'+p[3]+':'+p[4]+' '+p[5].replace('GMT','') );
  });
  app.use(morgan());
}

const cronServer = new CronServer();

/*MAP ROUTES*/
app.get('/last/:jobId',cronServer.getLastExecution);
app.get('/next/:jobId',cronServer.getNextJobExecution);
app.get('/next/pattern/:cronPattern',cronServer.getNextExecution);
app.get('/build/:targethost/:isImg',cronServer.buildCronFile);

app.get('/execution/:id',cronServer.getExecution);
app.put('/execution/:id',cronServer.putModel("execution"));
app.delete('/execution/:id',cronServer.deleteModel("execution"));
app.get('/execution',cronServer.getAllExecutions);
app.post('/execution',cronServer.postExecution);

app.get('/job/:id',cronServer.getJob);
app.put('/job/:id',cronServer.putModel("job"));
app.delete('/job/:id',cronServer.deleteModel("job"));
app.get('/job',cronServer.getAllJobs);
app.post('/job',cronServer.postJob);
app.get('/job/:id/avg',cronServer.getJobAverageExecution);


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

module.exports = app; // makes the server available for testing
