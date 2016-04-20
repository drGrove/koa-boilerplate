'use strict';
var expect = require('expect');
var app = require(process.env.PROJECT_ROOT + '/index');
var co = require('co');
var server = app.listen();
var request = require('co-supertest').agent(server);
var config = require(process.env.PROJECT_ROOT + '/lib/config');

describe('Auth:', function() {
  var res;
  after( function(done) {
    server.close();
    done();
  });

  before( function(done) {
    co( function*() {
      res = yield request
        .post(config.app.namespace + '/auth/login')
        .set('Content-Type', 'application/json')
        .send({
          email: process.env.USER_EMAIL,
          password: process.env.USER_PASSWORD
        })
        .end();
      done();
    });
  });

  describe('POST /auth/login -', function() {
    it('Should return a JWT', function(done) {
      expect(res.body).toBeA('object');
      expect(res.body.token).toBeA('string');
      expect(res.body.token.length).toBeGreaterThan(10);
      process.env.USER_TOKEN = res.body.token;
      done();
    });

    it('Should set USER_TOKEN', function(done) {
      expect(process.env.USER_TOKEN).toBe(res.body.token);
      done();
    });
  });
});
