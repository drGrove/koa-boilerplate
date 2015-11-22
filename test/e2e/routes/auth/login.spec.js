'use strict'
var expect = require('expect')
var app = app
var co = require('co')
var server = server
var request = require('co-supertest').agent(server)


describe('Auth:', function() {
  after( function(done) {
    server.close()
    done()
  })

  describe('POST /auth/login -', function () {
    before( function(done) {
      co( function*() {
        var res;
        res = yield request
          .post('/api/v1/auth/login')
          .set('Content-Type', 'application/json')
          .send({
            email: process.env.USER_EMAIL,
            password: process.env.USER_PASSWORD
          })
          .end()
        done()

      })
    })

    it('Should return a JWT', function(done) {
      var type = typeof res.body.token
      expect(res.body).toBeA('object')
      expect(res.body.token).toBeA('string')
      expect(res.body.token.length).toBeGreaterThan(10)
      process.env.USER_TOKEN = res.body.token
      done()
    })

    it('Should set USER_TOKEN', function(done) {
      expect(process.env.USER_TOKEN).toBe(res.body.token)
      done()
    })
  })
})
