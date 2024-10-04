process.env.NODE_ENV = process.env.NODE_ENV || 'development';
global.config = require('./config');
const Job = require('./src/models/job');
const Execution = require('./src/models/execution');

(async ()=>{
  //let jobs = await Job.getByHost('api',false);
  //console.log(jobs);
  // await Execution.deleteJobHistory(10);
  // await Job.truncate();
  // await Execution.truncate();
  //await Execution.db.close();
  let exec = new Execution();
  exec.jobId = 1;
  exec.startTime = new Date().toISOString().substring(0, 19).replace('T', ' ');
  exec.endTime = new Date(Date.now() + 5*60000).toISOString().substring(0, 19).replace('T', ' ');
  //console.log(exec);
  await exec.create();
})();

// const testJob = {
//   title:'test',
//   description:'test',
//   hostname:'test',
//   user:'root',
//   cronTime:'* * * * *',
//   friendlyTime:'Every Minute',
//   cmdToExec:'pwd',
//   outfile:'/tmp/test',
//   container:false
// };
//
// function _createJob(targetObj){
//   let job = new Job();
//   for(const [key,value] of Object.entries(targetObj)){
//     job[key] = value;
//   }
//   return job;
// }
//
// let job = _createJob(testJob);
// job._create().then(()=>{
//   console.log(job);
// });

// (async ()=>{
//   //await Job.truncate().then(()=>{console.log('I have resolved');});
//   // let job = await new Job(4)._build();
//   // let lastRun = job.getExecutionInterval().prev().toString();
//   // job.db.close();
//   // console.log(lastRun);
// })();
