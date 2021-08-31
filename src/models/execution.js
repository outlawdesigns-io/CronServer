"use strict";

const Record = require('outlawdesigns.io.noderecord');

class Execution extends Record{

  constructor(id){
    const database = process.env.NODE_ENV == 'production' ? 'cron':'cron_test';
    // const database = 'cron';
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
  async getAll(){
    let items = [];
    let ids = await this._getAll();
    for(let id in ids){
      let item = await new Execution(ids[id][this.primaryKey])._build();
      items.push(item._buildPublicObj());
    }
    return items;
  }
  translateDates(){
    this.startTime = this.db.date(this.startTime);
    this.endTime = this.db.date(this.endTime);
  }
  async getLast(jobId){
    return new Promise((resolve,reject)=>{
      let obj = new Execution();
      obj.db.table(obj.table).select(obj.primaryKey).where("jobId = " + jobId).orderBy("endTime desc limit 1").execute().then(async (data)=>{
        if(data.length){
          let exec = await new Execution(data[0][obj.primaryKey])._build();
          resolve(exec._buildPublicObj());
        }
        reject({error:"No Execution History"})
      }).catch(reject);
    });
  }
  static truncate(){
    let obj = new Execution();
    return obj.db.table(obj.table).truncate().execute();
  }
  static delete(targetId){
    let obj = new Execution();
    return obj.db.table(obj.table).delete().where(obj.primaryKey + ' = ' + targetId).execute();
  }
}

module.exports = Execution;
