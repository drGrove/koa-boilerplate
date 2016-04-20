'use strict';
var expect = require('expect');
var app = require(process.env.PROJECT_ROOT + '/index');
var co = require('co');
var server = app.listen();
var request = require('co-supertest').agent(server);
var config = require(process.env.PROJECT_ROOT + '/lib/config');

describe('GET: AUTHORIZED: /users/me', function() {
  var res;

  before( function(done) {
    co( function*() {
      res = yield request
        .get(config.app.namespace + '/users/me')
        .set('Authorization', 'Bearer ' + process.env.USER_TOKEN)
        .end();
      done();
    });
  });

  it('Should return a 200', function(done) {
    expect(res.statusCode).toBe(200);
    done();
  });

  it('Should be an object', function(done) {
    expect(res.body).toBeA('object');
    done();
  });

  it('Should set the body to an environment variable', function(done) {
    process.env.USER_BODY = JSON.stringify(res.body);
    expect(process.env.USER_BODY).toBe(JSON.stringify(res.body));
    done();
  });
});
