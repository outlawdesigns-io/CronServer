"use strict";

const parser = require('cron-parser');
const Record = require('outlawdesigns.io.noderecord');
const CronTemplate = require('../cronTemplate');
const Execution = require('./execution');

class Job extends Record{

  constructor(id){
    const database = global.config[process.env.NODE_ENV].DB_DB;
    const table = 'job';
    const primaryKey = 'id';
    super(database,table,primaryKey,id);
    this.publicKeys = [
      'id',
      'title',
      'description',
      'hostname',
      'user',
      'cronTime',
      'friendlyTime',
      'cmdToExec',
      'container',
      'imgName',
      'outfile',
      'shell',
      'pathVariable',
      'tz_code',
      'cronWrapperPath',
      'created_date'
    ];
  }
  getExecutionInterval(){
    try{
      let interval = parser.parseExpression(this.cronTime);
      return interval;
    }catch(err){
      throw err;
    }
  }
  static async getByHost(hostname, isImg = false){
    return new Promise((resolve,reject)=>{
      let obj = new Job();
      let colName = isImg ? "imgName":"hostname";
      obj.db.table(obj.table).select(obj.primaryKey).where(`${colName} = '${hostname}'`);
      if(!isImg){
        obj.db.andWhere("!container");
      }
      obj.db.execute().then( async (data)=>{
        let ret = [];
        for(let i = 0; i < data.length; i++){
          let job = await new Job(data[i][obj.primaryKey]).init();
          ret.push(job.getPublicProperties());
        }
        resolve(ret);
      }).catch(reject);
    });
  }
  static recordExists(targetId){
    return new Promise((resolve,reject)=>{
      let obj = new Job();
      obj.db.table(obj.table).select(obj.primaryKey).where(obj.primaryKey + ' = ' + targetId).execute().then((data)=>{
        if(!data.length){
          resolve(false);
        }
        resolve(true);
      }).catch(reject);
    });
  }
  static getPatternInterval(patternStr){
    try{
      let interval = parser.parseExpression(patternStr);
      return interval;
    }catch(err){
      throw err;
    }
  }
  static async buildCronFile(hostname,isImg = false){
    let templateStr = CronTemplate.headerText;
    let jobs = await Job.getByHost(hostname,isImg);
    if(!jobs.length){
      return '';
    }
    if(jobs[0].tz_code){
      templateStr += `TZ=${jobs[0].tz_code}\n`;
    }
    if(jobs[0].shell){
      templateStr += `SHELL=${jobs[0].shell}\n`;
    }
    if(jobs[0].pathVariable){
      templateStr += `PATH=${jobs[0].pathVariable}\n`;
    }
    templateStr = jobs.reduce((acc,e)=>{
      let wrapperPath = (e.cronWrapperPath ? e.cronWrapperPath:CronTemplate.cronWrapperDefaultPath) + CronTemplate.cronWrapperDefaultScript;
      return acc += `${e.cronTime} ${wrapperPath} ${e.id} "${e.cmdToExec}" "${e.outfile}"\n`;
    },templateStr);
    return templateStr;
  }
}

module.exports = Job;
