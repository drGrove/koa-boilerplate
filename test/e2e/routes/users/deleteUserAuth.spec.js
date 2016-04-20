'use strict';
var expect = require('expect');
var path = require('path');
var app = require(path.join(process.env.PROJECT_ROOT, '/index'));
var config = require(path.join(process.env.PROJECT_ROOT, '/lib/config'));
var co = require('co');
var server = app.listen();
var request = require('co-supertest').agent(server);

describe('DELETE: AUTHORIZED: /users/:id', function() {
  after(function(done) {
    server.close();
    done();
  });

  var res;

  before(function(done) {
    co(function*() {
      res = yield request
        .delete(config.app.namespace + '/users/me')
        .set('Authorization', 'Bearer ' + process.env.USER_TOKEN)
        .end();
      done();
    });
  });

  it('Should return 204', function(done) {
    expect(res.statusCode).toBe(204);
    done();
  });
});
