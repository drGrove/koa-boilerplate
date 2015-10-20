'use strict'
var expect = require('expect')
var app = require(process.env.PROJECT_ROOT + '/index')
var co = require('co')
var server = app.listen()
var request = require('co-supertest').agent(server)

describe('GET: AUTHORIZED: /users -', function() {
  after( function(done) {
    server.close()
    done()
  })

  var res;

  before(function (done) {
    co( function*() {
      res = yield request
        .get('/api/v1/users')
        .set('Authorization', 'Bearer ' + process.env.USER_TOKEN)
        .end()
      done()
    })
  })

  it('Should return a 200', function(done) {
    expect(res.statusCode).toBe(200)
    done()
  })

  it('Should be an array', function(done) {
    expect(Array.isArray(res.body)).toBe(true)
    done()
  })

  it('Should have a length', function(done) {
    expect(res.body.length).toBeGreaterThan(0)
    done()
  })
})
