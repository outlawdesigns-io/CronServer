process.env.NODE_ENV = 'testing';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
// const Execution = require('../src/models/execution');
const ModelFactory = require('outlawdesigns.io.cronmonitorsdk');
const should = chai.should();

const testModel = {
  jobId:'99',
  startTime:new Date().toISOString().substring(0, 19).replace('T', ' '),
  endTime:new Date().toISOString().substring(0, 19).replace('T', ' '),
  output:'/tmp/'
};

function _createModel(targetObj){
  let model = ModelFactory.get('execution');
  for(const [key,value] of Object.entries(targetObj)){
    model[key] = value;
  }
  return model;
}

chai.use(chaiHttp);

describe('Executions',()=>{
  beforeEach((done)=>{
    ModelFactory.getClass('execution').truncate().then(()=>{done()});
  });
  describe('/GET execution',()=>{
    it('should GET all the executions',(done)=>{
      chai.request(server).get('/execution').end((err,res)=>{
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(0);
        done();
      });
    });
  });
  describe('/POST execution',()=>{
    it('should POST a new execution',(done)=>{
      chai.request(server)
      .post('/execution')
      .field('Content-Type','multipart/form-data')
      .field('jobId',testModel.jobId)
      .field('startTime',testModel.startTime)
      .field('endTime',testModel.endTime)
      .field('output',testModel.output)
      .end((err,res)=>{
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('id');
        res.body.should.have.property('jobId');
        res.body.should.have.property('startTime');
        res.body.should.have.property('endTime');
        res.body.should.have.property('output').eql(testModel.output);
        done();
      });
    });
  });
  describe('/GET/:id execution',()=>{
    it('should GET an execution by the given id',(done)=>{
      let model = _createModel(testModel);
      model.create().then(()=>{
        chai.request(server).get('/execution/' + model.id).end((err,res)=>{
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('id').eql(model.id);
          res.body.should.have.property('jobId');
          res.body.should.have.property('startTime');
          res.body.should.have.property('endTime');
          res.body.should.have.property('output');
          done();
        });
      });
    });
  });
  describe('/PUT/:id execution',()=>{
    it('should UPDATE a execution by the given id',(done)=>{
      let model = _createModel(testModel);
      let updateModel = testModel;
      updateModel.output = '/tmp/trash';
      model.create().then(()=>{
        chai.request(server)
        .put('/execution/' + model.id)
        .field('Content-Type','multipart/form-data')
        .field('output',updateModel.output)
        .end((err,res)=>{
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('output').eql(updateModel.output);
          done();
        });
      });
    });
  });
  describe('/DELETE/:id execution',()=>{
    it('should DELETE an execution given the id',(done)=>{
      let model = _createModel(testModel);
      model.create().then(()=>{
        chai.request(server).delete('/execution/' + model.id).end((err,res)=>{
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('id').eql(model.id.toString());
          res.body.should.have.property('message').eql('Target Object Deleted');
          done();
        });
      });
    });
  });
});
