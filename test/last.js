process.env.NODE_ENV = 'testing';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const ModelFactory = require('outlawdesigns.io.cronmonitorsdk');

const should = chai.should();

const testJob = {
  title:'test',
  description:'test',
  hostname:'test',
  user:'root',
  cronTime:'*/5 * * * *',
  friendlyTime:'Every 5 Minutes',
  cmdToExec:'pwd',
  outfile:'/tmp/test',
  container:false,
  imgName:null,
  shell:'/bin/bash',
  pathVariable:null,
  tz_code:null,
  cronWrapperPath:'/home/me/'
};
const testExecution = {
  jobId:0,
  startTime: null,
  endTime: null,
  output: '/home/outlaw/scripts/'
};

function _createModel(targetObj,modelStr){
  let job = ModelFactory.get(modelStr);
  for(const [key,value] of Object.entries(targetObj)){
    job[key] = value;
  }
  return job;
}

chai.use(chaiHttp);

describe('Last',()=>{
  beforeEach((done)=>{
    ModelFactory.getClass('job').truncate().then(()=>{done()});
  });
  describe('/GET/:jobId',()=>{
    it('should GET the last execution of a job given the id',(done)=>{
      let job = _createModel(testJob,'job');
      let execution = _createModel(testExecution,'execution');
      job.create().then(()=>{
        execution.jobId = job.id;
        execution.startTime = new Date().toISOString().substring(0, 19).replace('T', ' ');
        execution.endTime = new Date(Date.now() + 5*60000).toISOString().substring(0, 19).replace('T', ' ');
        execution.create().then(()=>{
          chai.request(server).get('/last/' + job.id).end((err,res)=>{
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('id');
            res.body.should.have.property('jobId').eql(job.id);
            res.body.should.have.property('startTime').eql(execution.startTime);
            res.body.should.have.property('endTime').eql(execution.endTime);
            done();
          });
        });
      });
    });
  });
});

//ModelFactory.getClass('execution').getLast(req.params.jobId)
