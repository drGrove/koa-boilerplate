'use strict'
var expect = require('expect')
var app = require(process.env.PROJECT_ROOT + '/index')
var co = require('co')
var server = app.listen()
var request = require('co-supertest').agent(server)

describe('GET: UNAUTHORIZED: /users -', function() {
  after( function(done) {
    server.close()
    done()
  })

  var res;

  before(function (done) {
    co( function*() {
      res = yield request
        .get('/api/v1/users')
        .end()
      done()
    })
  })

  it('Should return a 401', function(done) {
    expect(res.statusCode).toBe(401)
    done()
  })

  it('Should be an object', function(done) {
    expect(res.body).toBeA('object')
    done()
  })
})
