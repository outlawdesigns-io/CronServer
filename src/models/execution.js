"use strict";

const Record = require('../libs/record');

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
  translateDates(){
    this.startTime = this.db.date(this.startTime);
    this.endTime = this.db.date(this.endTime);
  }
}

module.exports = Execution;
