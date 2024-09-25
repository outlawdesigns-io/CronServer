"use strict";

const Record = require('outlawdesigns.io.noderecord');

class Execution extends Record{

  constructor(id){
    const database = global.config[process.env.NODE_ENV].DB_DB;
    const table = 'execution';
    const primaryKey = 'id';
    super(database,table,primaryKey,id);
    this.publicKeys = [
      'id',
      'jobId',
      'startTime',
      'endTime',
      'output'
    ];
  }
  static recordExists(targetId){
    return new Promise((resolve,reject)=>{
      let obj = new Execution();
      obj.db.table(obj.table).select(obj.primaryKey).where(obj.primaryKey + ' = ' + targetId).execute().then((data)=>{
        if(!data.length){
          resolve(false);
        }
        resolve(true);
      }).catch(reject);
    });
  }
  translateDates(){
    this.startTime = this.db.date(this.startTime);
    this.endTime = this.db.date(this.endTime);
  }
  static async getLast(jobId){
    return new Promise((resolve,reject)=>{
      let obj = new Execution();
      obj.db.table(obj.table).select(obj.primaryKey).where("jobId = " + jobId).orderBy("endTime desc limit 1").execute().then(async (data)=>{
        if(data.length){
          let exec = await new Execution(data[0][obj.primaryKey]).init();
          resolve(exec.getPublicProperties());
        }
        reject({error:"No Execution History"})
      }).catch(reject);
    });
  }
  static async getAverageExecutionTime(jobId){
    try{
      let obj  = new Execution();
      let data = await obj.db.table(obj.table).select('avg(TIME_TO_SEC(TIMEDIFF(endTime,startTime))) as avg_execution_seconds').where('jobId = ' + jobId).execute();
      return data[0]['avg_execution_seconds'];
    }catch(err){
      // console.log(err);
      throw err;
    }
  }
  static async deleteJobHistory(jobId){
    try{
      let obj = new Execution();
      return obj.db.table(obj.table).delete().where('jobId = ' + jobId).execute();
    }catch(err){
      throw err;
    }
  }
}

module.exports = Execution;
