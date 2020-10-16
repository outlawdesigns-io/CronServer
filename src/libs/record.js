"use strict";

class Record{

    constructor(db,table,primaryKey,id){
        const database = require('./db');
        const config = require('../../config');
        this.database = db;
        this.table = table;
        this.primaryKey = primaryKey;
        this.id = id;
        this.db = new database(config.DBHOST,config.DBUSER,config.DBPASS,this.database);
    }
    async _build(){
      try{
        let data = await this.db.table(this.table).select('*').where(this.primaryKey + "= '" + this.id + "'").execute();
        let keys = Object.keys(data[0]);
        keys.forEach((key)=>{
          this[key] = data[0][key];
        });
      }catch(err){
        throw err;
      }
      return this;
    }
    _buildPublicObj(){
        let obj = {};
        this.publicKeys.forEach((key)=>{
            obj[key] = this[key];
            if(key === 'teh_date'){
                obj[key] = Record._getTehDate();
            }
            if(key === 'created_date'){
                obj[key] = this.db.date();
            }
        });
        return obj;
    }
    async _update(){
      let update = this._buildPublicObj();
      try{
        let result = await this.db.table(this.table).update(update).where(this.primaryKey + "= '" + this.id + "'").execute();
        return this._build();
      }catch(err){
        throw err;
      }
    }
    async _create(){
      let insertion = this._buildPublicObj();
      try{
        await this.db.table(this.table).insert(insertion).execute();
        let lastId = await this._getId();
        this.id = lastId[0][this.primaryKey];
         await this._build();
         return this;
      }catch(err){
        throw err;
      }
    }
    async _getId(){
      try{
        return await this.db.table(this.table).select(this.primaryKey).orderBy(this.primaryKey + " desc limit 1").execute();
      }catch(err){
        throw err;
      }
    }
    async _getAll(){
      let objs = [];
      try{
        let ids = await this.db.table(this.table).select(this.primaryKey).execute();
        for(let id in ids){
          let obj = await new this.constructor(ids[id].id)._build();
          objs.push(obj._buildPublicObj());
        }
      }catch(err){
        throw err
      }
      return objs;
    }
    static _getTehDate(){
        var dateObj = new Date();
        var month = dateObj.getUTCMonth() + 1; //months from 1-12
        var day = dateObj.getUTCDate();
        var year = dateObj.getUTCFullYear();
        if(month <= 9){
            month = '0' + month;
        }
        return year + "-" + month + "-" + day;
    }
}

module.exports = Record;
