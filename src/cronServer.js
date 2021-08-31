"use strict";

const http = require('https');
const Busboy = require('busboy');
const Job = require('./models/job');
const Execution = require('./models/execution');

class CronServer{
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
  async getLastExecution(req, res, next){
    if(process.env.NODE_ENV != 'production' || await CronServer.checkToken(req,res,next)){
      let execution = new Execution();
      try{
        res.send(await execution.getLast(req.params.jobId));
      }catch(err){
        res.send(err);
      }
    }
  }
  async getAllExecutions(req,res,next){
    if(process.env.NODE_ENV != 'production' || await CronServer.checkToken(req,res,next)){
      let execution = new Execution();
      res.send(await execution.getAll());
    }
  }
  async getExecution(req,res,next){
    if(process.env.NODE_ENV != 'production' || await CronServer.checkToken(req,res,next)){
      try{
        let job = new Execution(req.params.id);
        await job._build();
        return res.send(job._buildPublicObj());
      }catch(err){
        return res.status(404).send('Not Found');
      }
    }
  }
  async postExecution(req,res,next){
    if(process.env.NODE_ENV != 'production' || await CronServer.checkToken(req,res,next)){
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
        model = await model.create().catch((err)=>{
          console.log(err);
        });
        return res.send(model._buildPublicObj());
      });
      return req.pipe(busboy);
    }
  }
  async putExecution(req,res,next){
    const busboy = new Busboy({headers:req.headers});
    if(process.env.NODE_ENV != 'production' || await CronServer.checkToken(req,res,next)){
      try{
        let model = await new Execution(req.params.id)._build();
        busboy.on('field',(fieldname,val,fieldnameTruncated,valTruncated,encoding,mimetype)=>{model[fieldname] = val;});
        busboy.on('finish',async ()=>{
          model = await model._update();
          return res.send(model._buildPublicObj());
        });
        return req.pipe(busboy);
      }catch(err){
        res.status(400).send(err);
      }
    }
  }
  async deleteExecution(req,res,next){
    if(process.env.NODE_ENV != 'production' || await CronServer.checkToken(req,res,next)){
      try{
        await Execution.delete(req.params.id);
        return res.send({message:'Target Object Deleted',id:req.params.id});
      }catch(err){
        return res.status(400).send(err);
      }
    }
  }
  async getAllJobs(req,res,next){
    if(process.env.NODE_ENV != 'production' || await CronServer.checkToken(req,res,next)){
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
  async getJob(req,res,next){
    if(process.env.NODE_ENV != 'production' || await CronServer.checkToken(req,res,next)){
      try{
        let job = await new Job(req.params.id)._build();
        let obj = job._buildPublicObj();
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
  async putJob(req,res,next){
    const busboy = new Busboy({headers:req.headers});
    if(process.env.NODE_ENV != 'production' || await CronServer.checkToken(req,res,next)){
      try{
        let model = await new Job(req.params.id)._build();
        busboy.on('field',(fieldname,val,fieldnameTruncated,valTruncated,encoding,mimetype)=>{model[fieldname] = val;});
        busboy.on('finish',async ()=>{
          model = await model._update();
          return res.send(model._buildPublicObj());
        });
        return req.pipe(busboy);
      }catch(err){
        res.status(400).send(err);
      }
    }
  }
  async deleteJob(req,res,next){
    if(process.env.NODE_ENV != 'production' || await CronServer.checkToken(req,res,next)){
      try{
        await Job.delete(req.params.id);
        return res.send({message:'Target Object Deleted',id:req.params.id});
      }catch(err){
        return res.status(400).send(err);
      }
    }
  }
}

module.exports = CronServer;
