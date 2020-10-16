const Job = require('./src/models/job');

(async ()=>{
  let job = await new Job(3)._build();
  console.log(job.getExecutionInterval().next().toString());
})();
