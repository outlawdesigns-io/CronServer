process.env.NODE_ENV = 'testing';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const ModelFactory = require('../src/modelFactory');

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


function _createModel(targetObj,modelStr){
  let job = ModelFactory.get(modelStr);
  for(const [key,value] of Object.entries(targetObj)){
    job[key] = value;
  }
  return job;
}

chai.use(chaiHttp);

describe('Next',()=>{
  beforeEach((done)=>{
    ModelFactory.getClass('job').truncate().then(()=>{done()});
  });
  describe('/GET/:jobId',()=>{
    it('should GET the next execution of a job given the id',(done)=>{
      let job = _createModel(testJob,'job');
      job.create().then(()=>{
        chai.request(server).get('/next/' + job.id).end((err,res)=>{
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('next').eql(job.getExecutionInterval().next().toString());
          done();
        });
      });
    });
  });
  describe('/GET/pattern/:cronPattern',()=>{
    it('should GET the next execution of a job given the cron pattern',(done)=>{
      let job = _createModel(testJob,'job');
      job.create().then(()=>{
        chai.request(server).get('/next/pattern/' + encodeURIComponent(job.cronTime)).end((err,res)=>{
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('next').eql(job.getExecutionInterval().next().toString());
          done();
        });
      });
    });
  });
});
