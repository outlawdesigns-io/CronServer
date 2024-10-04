const Job = require('./models/job');
const Execution = require('./models/execution');

const models = {
  job: (id) => new Job(id),
  execution: (id) => new Execution(id)
}

const modelClasses = {
  job:Job,
  execution:Execution
}

module.exports = {
  get: (name,id) => {
    if(!models[name]){
      throw new Error(`Model ${name} does not exist`);
    }
    return models[name](id);
  },
  getClass: (name) => {
    if(!models[name]){
      throw new Error(`Model ${name} does not exist`);
    }
    return modelClasses[name];
  }
}
