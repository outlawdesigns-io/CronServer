"use strict";

const Record = require('outlawdesigns.io.noderecord');
const parser = require('cron-parser');

class Job extends Record{

  constructor(id){
    const database = 'cron';
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
  async getAll(){
    let jobs = [];
    let ids = await this._getAll();
    for(let id in ids){
      let job = await new Job(ids[id][this.primaryKey])._build();
      jobs.push(job._buildPublicObj());
    }
    return jobs;
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
}

module.exports = Job;
