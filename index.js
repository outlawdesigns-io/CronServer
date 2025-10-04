
import express from 'express';
import http from 'https';
import fs from 'fs';
import CronServer from './src/cronServer.js';
import './config.js';
import morgan from 'morgan';

/*SETUP THE EXPRESS SERVER*/
const app = express();
app.set('trust proxy',true);
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
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

process.env.NODE_TLS_REJECT_UNAUTHORIZED=0;
const cronServer = new CronServer(process.env.AUTH_DISCOVERY_URI, process.env.AUTH_CLIENT_ID, process.env.AUTH_CLIENT_AUDIENCE);

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
if(process.env.NODE_ENV !== 'testing'){
  app.listen(process.env.PORT,()=>{
    console.log(process.env.NODE_ENV + ' mode listening on port: ' + process.env.PORT);
  });
}

export default app; // makes the server available for testing
