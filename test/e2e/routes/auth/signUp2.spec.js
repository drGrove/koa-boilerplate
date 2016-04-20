'use strict';
var expect = require('expect');
var app = require(process.env.PROJECT_ROOT + '/index');
var co = require('co');
var server = app.listen();
var request = require('co-supertest').agent(server);
var config = require(process.env.PROJECT_ROOT + '/lib/config');
var userBody =
  { email: process.env.USER_EMAIL_SECONDARY
  , password: process.env.USER_PASSWORD_SECONDARY
  , firstname: 'Jonny 2'
  , lastname: 'Testerson'
  };

describe('SignUp:', function() {
  after( function(done) {
    server.close();
    done();
  });

  describe('POST /auth/signup', function() {
    var res;

    before( function(done) {
      co( function*() {
        res = yield request
          .post(config.app.namespace + '/auth/signup')
          .set('Content-Type', 'application/json')
          .send(userBody)
          .end();
        done();
      });
    });

    it('Should return JWT Token', function(done) {
      expect(res.body).toBeA('object');
      expect(res.body.token.length).toBeGreaterThan(10);
      process.env.USER_TOKEN = res.body.token;
      done();
    });

    it('Should set the web token as an environment variable', function(done) {
      expect(process.env.USER_TOKEN).toBe(res.body.token);
      done();
    });
  });
});
