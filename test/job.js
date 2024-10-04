process.env.NODE_ENV = 'testing';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const ModelFactory = require('../src/modelFactory');
//const Job = require('../src/models/job');
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

describe('Jobs',()=>{
  beforeEach((done)=>{
    ModelFactory.getClass('job').truncate().then(()=>{done()});
  });
  describe('/GET',()=>{
    it('should GET all the jobs',(done)=>{
      chai.request(server).get('/job').end((err,res)=>{
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(0);
        done();
      });
    });
  });
  describe('/POST',()=>{
    it('should POST a new job',(done)=>{
      chai.request(server)
      .post('/job')
      .field('Content-Type','multipart/form-data')
      .field('title',testJob.title)
      .field('description',testJob.description)
      .field('hostname',testJob.hostname)
      .field('user',testJob.user)
      .field('cronTime',testJob.cronTime)
      .field('friendlyTime',testJob.friendlyTime)
      .field('cmdToExec',testJob.cmdToExec)
      .field('outfile',testJob.outfile)
      .field('container',testJob.container)
      //.field('imgName',testJob.imgName)
      .field('shell',testJob.shell)
      //.field('pathVariable',testJob.pathVariable)
      //.field('tz_code',testJob.tz_code)
      .field('cronWrapperPath',testJob.cronWrapperPath)
      .end((err,res)=>{
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
        res.body.should.have.property('outfile');
        res.body.should.have.property('container');
        res.body.should.have.property('imgName');
        res.body.should.have.property('shell');
        res.body.should.have.property('pathVariable');
        res.body.should.have.property('tz_code');
        res.body.should.have.property('cronWrapperPath');
        res.body.should.have.property('created_date').eql(_createModel({},'job').db.date());
        done();
      });
    });
  });
  describe('/GET/:id',()=>{
    it('should GET a job by the given id',(done)=>{
      let job = _createModel(testJob,'job');
      job.create().then(()=>{
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
          done();
        });
      });
    });
  });
  describe('/PUT/:id',()=>{
    it('should UPDATE a job by the given id',(done)=>{
      let job = _createModel(testJob,'job');
      let updateJob = testJob;
      updateJob.title = 'updated test';
      job.create().then(()=>{
        chai.request(server)
        .put('/job/' + job.id)
        .field('Content-Type','multipart/form-data')
        .field('title',updateJob.title)
        .end((err,res)=>{
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('title').eql(updateJob.title);
          done();
        });
      });
    });
  });
  describe('/DELETE/:id',()=>{
    it('should DELETE a job given the id',(done)=>{
      let job = _createModel(testJob,'job');
      job.create().then(()=>{
        chai.request(server).delete('/job/' + job.id).end((err,res)=>{
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('id').eql(job.id.toString());
          res.body.should.have.property('message').eql('Target Object Deleted');
          done();
        });
      });
    });
  });
  describe('/GET/:id/avg',()=>{
    it('should GET the average execution time of a job given the id',(done)=>{
      let job = _createModel(testJob,'job');
      job.create().then(()=>{
        let execution = _createModel(testExecution,'execution');
        execution.jobId = job.id;
        execution.startTime = new Date().toISOString().substring(0, 19).replace('T', ' ');
        execution.endTime = new Date(Date.now() + 5*60000).toISOString().substring(0, 19).replace('T', ' ');
        execution.create().then(()=>{
          chai.request(server).get('/job/' + job.id + '/avg').end((err,res)=>{
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('avg_execution_seconds').eql(300);
            done();
          });
        });
      });
    });
  });
});
