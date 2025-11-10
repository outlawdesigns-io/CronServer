"use strict";

import http from 'https';
import busboy from 'busboy';
import ModelFactory from '@outlawdesigns/cronmonitorsdk';
import authClient from '@outlawdesigns/authenticationclient';

class CronServer{
  static PostErrorStr = 'POSTs must be made as multipart/form-data';
  static NullStr = 'null';
  static MaxPost = 10485760; //10MB
  constructor(oauthIssuerUrl, oathClientId, oauthAudience){
    this.checkToken = this.checkToken.bind(this);
    this.getModel = this.getModel.bind(this);
    this.getAll = this.getAll.bind(this);
    this.postModel = this.postModel.bind(this);
    this.putModel = this.putModel.bind(this);
    this.deleteModel = this.deleteModel.bind(this);
    this.getLastExecution = this.getLastExecution.bind(this);
    this.getNextJobExecution = this.getNextJobExecution.bind(this);
    this.getNextPatternExecution = this.getNextPatternExecution.bind(this);
    this.postExecution = this.postExecution.bind(this);
    this.getAllJobs = this.getAllJobs.bind(this);
    this.getJob = this.getJob.bind(this);
    this.postJob = this.postJob.bind(this);
    this.buildCronFile = this.buildCronFile.bind(this);
    this.getJobAverageExecution = this.getJobAverageExecution.bind(this);
    this._authAudience = oauthAudience;
    this._authClient = authClient;
    this._authClient.init(oauthIssuerUrl, oathClientId);
  }
  async checkToken(req,res,next){
    let auth_token = (req.headers['authorization'] || '' ).split(' ')[1] || null;
    try{
      let resp = await this._authClient.verifyAccessToken(auth_token,this._authAudience);
      return true;
    }catch(err){
      return false;
      //return res.status(403).send({error:err.message});
    }
  }
  getModel(modelStr){
    return async (req,res,next)=>{
      if(process.env.NODE_ENV != 'production' || await this.checkToken(req,res,next)){
        try{
          let model = await ModelFactory.get(modelStr,req.params.id).init();
          return res.send(model.getPublicProperties());
        }catch(err){
          return res.status(404).send('Not Found');
        }
      }else{
        res.status(400).send({message:'Token Verification Error.'});
      }
    }
  }
  getAll(modelStr){
    return async(req,res,next)=>{
      if(process.env.NODE_ENV != 'production' || await this.checkToken(req,res,next)){
        try{
          return res.send(await ModelFactory.getClass(modelStr).getAll());
        }catch(err){
          return res.status(400).send(err);
        }
      }else{
        res.status(400).send({message:'Token Verification Error.'});
      }
    }
  }
  postModel(modelStr){
    return async(req,res,next)=>{
      if(process.env.NODE_ENV != 'production' || await this.checkToken(req,res,next)){
        let bb;
        try{
          bb = busboy({headers:req.headers});
        }catch(err){
          return res.status(400).send({error:CronServer.PostErrorStr});
        }
        let model = ModelFactory.get(modelStr);
        bb.on('field',(fieldname,val,fieldnameTruncated,valTruncated,encoding,mimetype)=>{ model[fieldname] = val == CronServer.NullStr ? null:val; });
        bb.on('finish', async ()=>{
          try{
            model = await model.create();
            return res.send(model.getPublicProperties());
          }catch(err){
            return res.status(400).send({error:err});
          }
        });
        return req.pipe(bb);
      }else{
        res.status(400).send({message:'Token Verification Error.'});
      }
    }
  }
  putModel(modelStr){
    return async(req,res,next) => {
      const bb = busboy({headers:req.headers});
      if(process.env.NODE_ENV != 'production' || await this.checkToken(req,res,next)){
        try{
          let model = await ModelFactory.get(req.originalUrl.replace(/[^a-zA-Z]/g, ""),req.params.id).init();
          bb.on('field',(fieldname,val,fieldnameTruncated,valTruncated,encoding,mimetype)=>{model[fieldname] = val == CronServer.NullStr ? null:val; });
          bb.on('finish',async ()=>{
            await model.update();
            return res.send(model.getPublicProperties());
          });
          bb.on('error',(err)=>{
            return res.status(400).send({error:err.message});
          });
          return req.pipe(bb);
        }catch(err){
          return res.status(400).send(err);
        }
      }else{
        res.status(400).send({message:'Token Verification Error.'});
      }
    }
  }
  deleteModel(modelStr){
    return async(req,res,next)=>{
      if(process.env.NODE_ENV != 'production' || await this.checkToken(req,res,next)){
        try{
          await ModelFactory.getClass(modelStr).delete(req.params.id);
          return res.send({message:'Target Object Deleted',id:req.params.id});
        }catch(err){
          return res.status(400).send(err);
        }
      }else{
        res.status(400).send({message:'Token Verification Error.'});
      }
    }
  }
  async getLastExecution(req, res, next){
    if(process.env.NODE_ENV != 'production' || await this.checkToken(req,res,next)){
      try{
        res.send(await ModelFactory.getClass('execution').getLast(req.params.jobId));
      }catch(err){
        res.send(err);
      }
    }else{
      res.status(400).send({message:'Token Verification Error.'});
    }
  }
  async getNextJobExecution(req, res, next){
    if(process.env.NODE_ENV != 'production' || await this.checkToken(req,res,next)){
      try{
        let job = await ModelFactory.get('job',req.params.jobId).init();
        res.send({job:req.params.jobId,next:job.getExecutionInterval().next().toString()});
      }catch(err){
        res.status(400).send(err);
      }
    }else{
      res.status(400).send({message:'Token Verification Error.'});
    }
  }
  async getNextPatternExecution(req,res,next){
    if(process.env.NODE_ENV != 'production' || await this.checkToken(req,res,next)){
      let cronPattern = decodeURI(req.params.cronPattern);
      try{
        res.send({pattern:cronPattern,next:ModelFactory.getClass('job').getPatternInterval(cronPattern).next().toString()});
      }catch(err){
        res.status(400).send(err);
      }
    }else{
      res.status(400).send({message:'Token Verification Error.'});
    }
  }
  async postExecution(req,res,next){
    if(process.env.NODE_ENV != 'production' || await this.checkToken(req,res,next)){
      const bb = busboy({headers:req.headers, fieldSize: CronServer.MaxPost}); //10mb
      let model = ModelFactory.get('execution');
      let fileContents = '';
      bb.on('file',(fieldname,file,filename,encoding,mimetype)=>{
        file.on('data',(data)=>{
          fileContents += data;
        });
        file.on('end',()=>{
          model.output = fileContents.replace(/[^\x20-\x7E\n\r]/g, '');
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
    }else{
      res.status(400).send({message:'Token Verification Error.'});
    }
  }
  async getAllJobs(req,res,next){
    if(process.env.NODE_ENV != 'production' || await this.checkToken(req,res,next)){
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
    }else{
      res.status(400).send({message:'Token Verification Error.'});
    }
  }
  async getJob(req,res,next){
    if(process.env.NODE_ENV != 'production' || await this.checkToken(req,res,next)){
      try{
        let job = await ModelFactory.get('job',req.params.id).init();
        let obj = job.getPublicProperties();
        obj['nextRun'] = job.getExecutionInterval().next().toString();
        obj['lastRun'] = job.getExecutionInterval().prev().toString();
        return res.send(obj);
      }catch(err){
        console.log(err);
        return res.status(404).send('Not Found');
      }
    }else{
      res.status(400).send({message:'Token Verification Error.'});
    }
  }
  async postJob(req,res,next){
    if(process.env.NODE_ENV != 'production' || await this.checkToken(req,res,next)){
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
    }else{
      res.status(400).send({message:'Token Verification Error.'});
    }
  }
  async buildCronFile(req,res,next){
    if(process.env.NODE_ENV != 'production' || await this.checkToken(req,res,next)){
      let fileStr = await ModelFactory.getClass('job').buildCronFile(req.params.targethost,(req.params.isImg === 'true'));
      if(!fileStr){
        res.send({error:'No jobs'});
      }else{
        res.set({"Content-Disposition":"attachment; filename=\"crontab\""});
        res.send(fileStr);
      }
    }else{
      res.status(400).send({message:'Token Verification Error.'});
    }
  }
  async getJobAverageExecution(req,res,next){
    if(process.env.NODE_ENV != 'production' || await this.checkToken(req,res,next)){
      try{
        let avg = await ModelFactory.getClass('execution').getAverageExecutionTime(req.params.id);
        return res.send({'avg_execution_seconds':avg});
      }catch(err){
        // console.log(err);
        return res.send({'error':err.message});
      }
    }else{
      res.status(400).send({message:'Token Verification Error.'});
    }
  }
}

export default CronServer;
