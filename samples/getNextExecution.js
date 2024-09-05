const Job = require('./src/models/job');

(async ()=>{
  let job = await new Job(3).init();
  console.log(job.getExecutionInterval().next().toString());
})();
