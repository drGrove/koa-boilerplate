'use strict';
var expect = require('expect');
var app = require(process.env.PROJECT_ROOT + '/index');
var co = require('co');
var server = app.listen();
var request = require('co-supertest').agent(server);
var config = require(process.env.PROJECT_ROOT + '/lib/config');

describe('PUT: AUTHORIZED: /users/me', function() {
  var res;

  var body =
    { firstname: process.env.USER_FIRSTNAME
    };

  before( function(done) {
    co( function*() {
      res = yield request
        .put(config.app.namespace + '/users/me')
        .set('Authorization', 'Bearer ' + process.env.USER_TOKEN)
        .send(body)
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

  it(`Should have the firstname: ${body.firstname}`, function(done) {
    expect(res.body.firstname).toBe(body.firstname);
    done();
  });
});
