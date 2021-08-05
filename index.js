const express = require('express');
//const bodyParser = require('body-parser');
const http = require('https');
const fs = require('fs');

const Busboy = require('busboy');
const Job = require('./src/models/job');
const Execution = require('./src/models/execution');

const app = express();
// app.use(bodyParser.json({limit: '50mb'}));
// app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
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
async function _getLastExecution(req, res, next){
  if(await _checkToken(req,res,next)){
    let execution = new Execution();
    try{
      res.send(await execution.getLast(req.params.jobId));
    }catch(err){
      res.send(err);
    }
  }
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
    const busboy = new Busboy({headers:req.headers});
    let model = new Execution();
    fileContents = '';
    busboy.on('file',(fieldname,file,filename,encoding,mimetype)=>{
      file.on('data',(data)=>{
        fileContents += data;
      });
      file.on('end',()=>{
        model.output = fileContents;
      });
    });
    busboy.on('field',(fieldname,val,fieldnameTruncated,valTruncated,encoding,mimetype)=>{
      model[fieldname] = val;
    });
    busboy.on('finish',async ()=>{
      model.translateDates();
      let ret = model._buildPublicObj();
      model = await model._create().catch((err)=>{
        console.log(err);
      });
      //console.log(model);
      return res.send(model._buildPublicObj());
      //res.send(ret);
    });
    return req.pipe(busboy);
  }
}
async function _getAllJobs(req,res,next){
  if(await _checkToken(req,res,next)){
    let staticjob = new Job();
    let jobs = [];
    let ids = await staticjob._getAll();
    for(let id in ids){
      let job = await new Job(ids[id].id)._build();
      let nextRun = job.getExecutionInterval().next().toString();
      let lastRun = job.getExecutionInterval().prev().toString();
      let cleanObj = job._buildPublicObj();
      cleanObj['nextRun'] = nextRun;
      cleanObj['lastRun'] = lastRun;
      jobs.push(cleanObj);
    }
    res.send(jobs);
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
    const busboy = new Busboy({headers:req.headers});
    let model = new Job();
    busboy.on('field',(fieldname,val,fieldnameTruncated,valTruncated,encoding,mimetype)=>{
      model[fieldname] = val;
    });
    busboy.on('finish',async ()=>{
      model = await model._create().catch(console.error);
      return res.send(model._buildPublicObj());
    });
    return req.pipe(busboy);
  }
}

app.get('/last/:jobId',_getLastExecution);
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
