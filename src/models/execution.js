"use strict";

const Record = require('outlawdesigns.io.noderecord');

class Execution extends Record{

  constructor(id){
    const database = 'cron';
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
}

module.exports = Execution;
