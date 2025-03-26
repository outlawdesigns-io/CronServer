"use strict";

const http = require('https');
const busboy = require('busboy');

const ModelFactory = require('outlawdesigns.io.cronmonitorsdk');

class CronServer{
  static NullStr = 'null';
  static MaxPost = 10485760; //10MB
  static verifyToken(auth_token){
    if(auth_token === undefined){
      throw {error:'Token not present'};
    }
    return new Promise(function(resolve, reject){
      let options = {
        hostname:global.config[process.env.NODE_ENV].ACCNTHOST,
        port:global.config[process.env.NODE_ENV].ACCNTPORT,
        path:global.config[process.env.NODE_ENV].ACCNTVERIFYEND,
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
  static async checkToken(req,res,next){
    if(!req.headers['auth_token']){
      res.status(400).send('auth_token missing.');
      return false;
    }
    let user = await CronServer.verifyToken(req.headers.auth_token).catch(console.error);
    if("error" in user){
      res.status(400).send(user.error);
      return false;
    }
    return true;
  }
  putModel(modelStr){
    return async(req,res,next) => {
      const bb = busboy({headers:req.headers});
      if(process.env.NODE_ENV != 'production' || await CronServer.checkToken(req,res,next)){
        try{
          let model = await ModelFactory.get(req.originalUrl.replace(/[^a-zA-Z]/g, ""),req.params.id).init();
          bb.on('field',(fieldname,val,fieldnameTruncated,valTruncated,encoding,mimetype)=>{model[fieldname] = val == CronServer.NullStr ? null:val; });
          bb.on('finish',async ()=>{
            await model.update();
            return res.send(model.getPublicProperties());
          });
          return req.pipe(bb);
        }catch(err){
          res.status(400).send(err);
        }
      }
    }
  }
  deleteModel(modelStr){
    return async(req,res,next)=>{
      if(process.env.NODE_ENV != 'production' || await CronServer.checkToken(req,res,next)){
        try{
          await ModelFactory.getClass(modelStr).delete(req.params.id);
          return res.send({message:'Target Object Deleted',id:req.params.id});
        }catch(err){
          return res.status(400).send(err);
        }
      }
    }
  }
  async getLastExecution(req, res, next){
    if(process.env.NODE_ENV != 'production' || await CronServer.checkToken(req,res,next)){
      try{
        res.send(await ModelFactory.getClass('execution').getLast(req.params.jobId));
      }catch(err){
        res.send(err);
      }
    }
  }
  async getNextJobExecution(req, res, next){
    if(process.env.NODE_ENV != 'production' || await CronServer.checkToken(req,res,next)){
      try{
        let job = await ModelFactory.get('job',req.params.jobId).init();
        res.send({job:req.params.jobId,next:job.getExecutionInterval().next().toString()});
      }catch(err){
        res.status(400).send(err);
      }
    }
  }
  async getNextExecution(req,res,next){
    if(process.env.NODE_ENV != 'production' || await CronServer.checkToken(req,res,next)){
      let cronPattern = decodeURI(req.params.cronPattern);
      try{
        res.send({pattern:cronPattern,next:ModelFactory.getClass('job').getPatternInterval(cronPattern).next().toString()});
      }catch(err){
        res.status(400).send(err);
      }
    }
  }
  async getAllExecutions(req,res,next){
    if(process.env.NODE_ENV != 'production' || await CronServer.checkToken(req,res,next)){
      res.send(await ModelFactory.getClass('execution').getAll());
    }
  }
  async getExecution(req,res,next){
    if(process.env.NODE_ENV != 'production' || await CronServer.checkToken(req,res,next)){
      try{
        let model = await ModelFactory.get('execution',req.params.id).init();
        return res.send(model.getPublicProperties());
      }catch(err){
        return res.status(404).send('Not Found');
      }
    }
  }
  async postExecution(req,res,next){
    if(process.env.NODE_ENV != 'production' || await CronServer.checkToken(req,res,next)){
      const bb = busboy({headers:req.headers, fieldSize: CronServer.MaxPost}); //10mb
      let model = ModelFactory.get('execution');
      let fileContents = '';
      bb.on('file',(fieldname,file,filename,encoding,mimetype)=>{
        file.on('data',(data)=>{
          fileContents += data;
        });
        file.on('end',()=>{
          model.output = fileContents.replace(/[^ -~]/g, '');
        });
      });
      bb.on('field',(fieldname,val,fieldnameTruncated,valTruncated,encoding,mimetype)=>{
        model[fieldname] = val;
      });
      bb.on('finish',async ()=>{
        model.translateDates();
        let ret = model.getPublicProperties();
        model = await model.create().catch((err)=>{
          return res.status(400).send(err);
        });
        return res.send(model.getPublicProperties());
      });
      return req.pipe(bb);
    }
  }
  async getAllJobs(req,res,next){
    if(process.env.NODE_ENV != 'production' || await CronServer.checkToken(req,res,next)){
      let jobs = [];
      let ids = await ModelFactory.getClass('job').getAll();
      for(let id in ids){
        let job = await ModelFactory.get('job',ids[id].id).init();
        let nextRun = job.getExecutionInterval().next().toString();
        let lastRun = job.getExecutionInterval().prev().toString();
        let cleanObj = job.getPublicProperties();
        cleanObj['nextRun'] = nextRun;
        cleanObj['lastRun'] = lastRun;
        jobs.push(cleanObj);
      }
      res.send(jobs);
    }
  }
  async getJob(req,res,next){
    if(process.env.NODE_ENV != 'production' || await CronServer.checkToken(req,res,next)){
      try{
        let job = await ModelFactory.get('job',req.params.id).init();
        let obj = job.getPublicProperties();
        obj['nextRun'] = job.getExecutionInterval().next().toString();
        obj['lastRun'] = job.getExecutionInterval().prev().toString();
        res.send(obj);
      }catch(err){
        res.status(404).send('Not Found');
      }
    }
  }
  async postJob(req,res,next){
    if(process.env.NODE_ENV != 'production' || await CronServer.checkToken(req,res,next)){
      const bb = busboy({headers:req.headers});
      let model = ModelFactory.get('job');
      bb.on('field',(fieldname,val,fieldnameTruncated,valTruncated,encoding,mimetype)=>{
        model[fieldname] = val;
      });
      bb.on('finish',async ()=>{
        model.created_date = model.db.date();
        model = await model.create().catch(console.error);
        let returnObj = model.getPublicProperties();
        returnObj['nextRun'] = model.getExecutionInterval().next().toString();
        returnObj['lastRun'] = model.getExecutionInterval().prev().toString();
        return res.send(returnObj);
      });
      return req.pipe(bb);
    }
  }
  async buildCronFile(req,res,next){
    if(process.env.NODE_ENV != 'production' || await CronServer.checkToken(req,res,next)){
      let fileStr = await ModelFactory.getClass('job').buildCronFile(req.params.targethost,(req.params.isImg === 'true'));
      if(!fileStr){
        res.send({error:'No jobs'});
      }else{
        res.set({"Content-Disposition":"attachment; filename=\"crontab\""});
        res.send(fileStr);
      }
    }
  }
  async getJobAverageExecution(req,res,next){
    if(process.env.NODE_ENV != 'production' || await CronServer.checkToken(req,res,next)){
      try{
        let avg = await ModelFactory.getClass('execution').getAverageExecutionTime(req.params.id);
        return res.send({'avg_execution_seconds':avg});
      }catch(err){
        // console.log(err);
        return res.send({'error':err.message});
      }
    }
  }
}

module.exports = CronServer;
