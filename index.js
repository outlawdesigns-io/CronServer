
import express from 'express';
import http from 'https';
import fs from 'fs';
import CronServer from './src/cronServer.js';
import config from './config.js';
import morgan from 'morgan';

global.config = config;


/*SETUP THE EXPRESS SERVER*/
const app = express();
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, auth_token");
  res.header("Access-Control-Allow-Methods", "*");
  next();
});
if(process.env.NODE_ENV !== 'testing'){
  //start logging
  morgan.token('date', function() {
    var p = new Date().toString().replace(/[A-Z]{3}\+/,'+').split(/ /);
    return( p[2]+'/'+p[1]+'/'+p[3]+':'+p[4]+' '+p[5].replace('GMT','') );
  });
  app.use(morgan('combined'));
}

const cronServer = new CronServer();

/*MAP ROUTES*/
app.get('/last/:jobId',cronServer.getLastExecution);
app.get('/next/:jobId',cronServer.getNextJobExecution);
app.get('/next/pattern/:cronPattern',cronServer.getNextPatternExecution);
app.get('/build/:targethost/:isImg',cronServer.buildCronFile);

app.get('/execution/:id',cronServer.getModel('execution'));
app.put('/execution/:id',cronServer.putModel("execution"));
app.delete('/execution/:id',cronServer.deleteModel("execution"));
app.get('/execution',cronServer.getAll('execution'));
app.post('/execution',cronServer.postExecution);

app.get('/job/:id',cronServer.getJob);
app.put('/job/:id',cronServer.putModel("job"));
app.delete('/job/:id',cronServer.deleteModel("job"));
app.get('/job',cronServer.getAllJobs);
app.post('/job',cronServer.postJob);
app.get('/job/:id/avg',cronServer.getJobAverageExecution);

app.get('/event',cronServer.getAll('event'));
app.get('/event/:id',cronServer.getModel('event'));

app.get('/subscription',cronServer.getAll('subscription'));
app.get('/subscription/:id',cronServer.getModel('subscription'));
app.put('/subscription/:id',cronServer.putModel('subscription'));
app.delete('/subscription/:id',cronServer.deleteModel('subscription'));
app.post('/subscription',cronServer.postModel('subscription'));


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

export default app; // makes the server available for testing
