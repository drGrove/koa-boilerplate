'use strict'
var expect = require('expect')
var app = require(process.env.PROJECT_ROOT + '/index')
var co = require('co')
var server = app.listen()
var request = require('co-supertest').agent(server)

after(function(done) {
  server.close()
  done()
})

describe('GET: UNAUTHORIZED: /users', function() {
  var res;

  before( function(done) {
    co( function*() {
      res = yield request
        .get('/api/v1/users/me')
      done()
    })
  })

  it('Should return unauthorized if not logged in', function(done) {
    expect(res.statusCode).toBe(401)
    done()
  })

  it('Should be an object', function(done) {
    expect(res.body).toBeA('object')
    done()
  })
})
