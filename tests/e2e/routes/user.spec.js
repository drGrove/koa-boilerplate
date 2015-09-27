'use strict'
var expect = require('expect')
var app = require(process.env.PROJECT_ROOT + '/index')
var request = require('co-supertest').agent(app.listen())

describe('User Endpoints:', function() {
  describe('GET Users -', function() {
    var res;

    before(function *() {
      res = yield request.get('/api/v1/users')
        .expect(200)
        .end()
    })

    it('Should return a 200', function() {
      expect(res.statusCode).toBe(200)
    })

    it('Should be an array', function() {
      expect(Array.isArray(res.body)).toBe(true)
    })

    it('Should have a length', function() {
      expect(res.body.length).toBeGreaterThan(0)
    })
  })

  describe('GET User -', function() {
    var res;

    beforeEach(function *() {
      res = yield request.get('/api/v1/users/4')
        .end()
    })

    it('Should return unauthorized if not logged in', function() {
      expect(res.statusCode).toBe(401)
    })

    it('Should be an object', function() {
      expect(res.body).toBeA('object')
    })
  })
})
