process.env.NODE_ENV = 'testing';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const Job = require('../src/models/job');
const should = chai.should();

const testJob = {
  title:'test',
  description:'test',
  hostname:'test',
  user:'root',
  cronTime:'* * * * *',
  friendlyTime:'Every Minute',
  cmdToExec:'pwd',
  outfile:'/tmp/test',
  container:false
};

function _createJob(targetObj){
  let job = new Job();
  for(const [key,value] of Object.entries(targetObj)){
    job[key] = value;
  }
  return job;
}

chai.use(chaiHttp);

describe('jobs',()=>{
  beforeEach((done)=>{
    Job.truncate().then(()=>{done()});
  });
  describe('/GET job',()=>{
    it('should GET all the jobs',(done)=>{
      chai.request(server).get('/job').end((err,res)=>{
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(0);
        done();
      });
    });
  });
  describe('/POST job',()=>{
    it('should POST a new job',(done)=>{
      chai.request(server).post('/job').send(testJob).end((err,res)=>{
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('id');
        res.body.should.have.property('title');
        res.body.should.have.property('description');
        res.body.should.have.property('hostname');
        res.body.should.have.property('user');
        res.body.should.have.property('cronTime');
        res.body.should.have.property('friendlyTime');
        res.body.should.have.property('cmdToExec');
        res.body.should.have.property('container');
        res.body.should.have.property('imgName');
        res.body.should.have.property('outfile');
        res.body.should.have.property('created_date');
      });
      done();
    });
  });
  describe('/GET/:id job',()=>{
    it('should GET a job by the given id',(done)=>{
      let job = _createJob(testJob);
      job._create().then(()=>{
        chai.request(server).get('/job/' + job.id).end((err,res)=>{
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('id').eql(job.id);
          res.body.should.have.property('title');
          res.body.should.have.property('description');
          res.body.should.have.property('hostname');
          res.body.should.have.property('user');
          res.body.should.have.property('cronTime');
          res.body.should.have.property('friendlyTime');
          res.body.should.have.property('cmdToExec');
          res.body.should.have.property('container');
          res.body.should.have.property('imgName');
          res.body.should.have.property('outfile');
          res.body.should.have.property('created_date');
        });
        done();
      });
    });
  });
});
