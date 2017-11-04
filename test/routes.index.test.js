/* eslint-disable no-unused-expressions */
const MongoClient = require('mongodb').MongoClient;
const config = require('../src/config');
const MONGO_URL = `mongodb://${config.url}/${config.db}`;
const app = require('../src/server');
require('should');
const server = app.listen();

let request;

/**
 * Connection with Mongo and run server
 * @param app
 * @param done
 * @returns {Promise.<void>}
 */
const connect = async(app, done) => {
  try {
    const connection = await MongoClient.connect(MONGO_URL);
    app.todos = connection.collection(config.collection);
    request = require('supertest').agent(server);
    done();
  } catch (e) {
    console.error(e);
    done();
  }
};

/**
 * Tests for Todos: Get All, Get One, Add, Update One, Delete One
 */
describe('Todos', () => {
  before(done => {
    connect(app, done);
  });

  after(done => {
    server.close(done);
  });

  it('should see todos', done => {
    request
      .get('/api')
      .expect(200, (err, res) => {
        if (err) return done(err);
        res.should.be.json;
        done();
      });
  });

  it('should see add todos', done => {
    request
      .post('/api/todo').send({'title': '3', 'priority': 1, 'state': 2, 'term': '30.10.2017'})
      .expect(200, (err, res) => {
        if (err) return done(err);
        res.should.be.json;
        res.body.result.should.have.property('ok', 1);
        global.id = res.body.insertedIds[0];
        done();
      });
  });

  it('should see one todo', done => {
    request
      .get(`/api/todo/${global.id}`)
      .expect(200, (err, res) => {
        if (err) return done(err);
        res.should.be.json;
        res.body.should.have.property('title', '3');
        res.body.should.have.property('priority', 1);
        res.body.should.have.property('state', 2);
        res.body.should.have.property('term', '1970-01-01T00:00:00.000Z');
        done();
      });
  });

  it('should put todo', done => {
    request
      .put(`/api/todo/${global.id}`).send({'title': '3', 'priority': 1, 'state': 3, 'term': '30.10.2017'})
      .expect(200, (err, res) => {
        if (err) return done(err);
        res.should.be.json;
        res.body.should.have.property('ok', 1);
        done();
      });
  });

  it('should delete todo', done => {
    request
      .delete(`/api/todo/${global.id}`)
      .expect(200, (err, res) => {
        if (err) return done(err);
        res.should.be.json;
        res.body.should.have.property('ok', 1);
        done();
      });
  });
});
