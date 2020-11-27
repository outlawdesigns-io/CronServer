const express = require('express');
const bodyParser = require('body-parser');
const http = require('https');
const fs = require('fs');

const Job = require('./src/models/job');
const Execution = require('./src/models/execution');

const app = express();
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(require('morgan')('combined'));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, auth_token, request_token, password");
  res.header("Access-Control-Allow-Methods", "*");
  next();
});

global.config = require('./config');

function _verifyToken(auth_token){
  if(auth_token === undefined){
    throw {error:'Token not present'};
  }
  return new Promise(function(resolve, reject){
    let options = {
      hostname:global.config.ACCNTHOST,
      port:global.config.ACCNTPORT,
      path:global.config.ACCNTVERIFYEND,
      method:'GET',
      headers:{
        'Content-Type':'application/json; charset=utf-8',
        'auth_token':auth_token,
      }
    };
    let req = http.request(options,function(response){
      let data = '';
      response.on('data',function(chunk){
        data += chunk;
      });
      response.on('end',function(){
        resolve(JSON.parse(data));
      });
    }).on('error',function(err){
      reject(err.message);
    });
    req.write(JSON.stringify(auth_token));
  });
}
async function _checkToken(req,res,next){
  if(!req.headers['auth_token']){
    res.status(400).send('auth_token missing.');
    return false;
  }
  let user = await _verifyToken(req.headers.auth_token).catch(console.error);
  if("error" in user){
    res.status(400).send(user.error);
    return false;
  }
  return true;
}
async function _getAllExecutions(req,res,next){
  if(await _checkToken(req,res,next)){
    let execution = new Execution();
    res.send(await execution.getAll());
  }
}
async function _getExecution(req,res,next){
  if(await _checkToken(req,res,next)){
    let job = new Execution(req.params.id);
    await job._build();
    res.send(job._buildPublicObj());
  }
}
async function _postExecution(req,res,next){
  if(await _checkToken(req,res,next)){
    let model = new Execution();
    let keys = Object.keys(req.body);
    keys.forEach((key)=>{
      model[key] = req.body[key];
    });
    model.translateDates();
    model = await model._create().catch(console.error);
    return res.send(model._buildPublicObj());
  }
}
async function _getAllJobs(req,res,next){
  if(await _checkToken(req,res,next)){
    let job = new Job();
    res.send(await job.getAll());
  }
}
async function _getJob(req,res,next){
  if(await _checkToken(req,res,next)){
    let job = await new Job(req.params.id)._build();
    let obj = job._buildPublicObj();
    obj['nextRun'] = job.getExecutionInterval().next().toString();
    obj['lastRun'] = job.getExecutionInterval().prev().toString();
    res.send(obj);
  }
}
async function _postJob(req,res,next){
  if(await _checkToken(req,res,next)){
    let model = new Job();
    let keys = Object.keys(req.body);
    keys.forEach((key)=>{
      model[key] = req.body[key];
    });
    model = await model._create().catch(console.error);
    return res.send(model._buildPublicObj());
  }
}

app.get('/execution/:id',_getExecution);
app.get('/execution',_getAllExecutions);
app.post('/execution',_postExecution);
app.get('/job/:id',_getJob);
app.get('/job',_getAllJobs);
app.post('/job',_postJob);


if(global.config.DEBUG){
  app.listen(global.config.LIVEPORT,()=>{
    console.log('Listening on port: ' + global.config.LIVEPORT);
  });
}else{
  http.createServer({
    key: fs.readFileSync(config.SSLKEYPATH),
    cert: fs.readFileSync(config.SSLCERTPATH)
  },app).listen(config.LIVEPORT,()=>{
    console.log('Listening on port: ' + global.config.LIVEPORT);
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
