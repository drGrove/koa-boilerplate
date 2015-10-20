'use strict'
var expect = require('expect')
var app = require(process.env.PROJECT_ROOT + '/index')
var co = require('co')
var server = app.listen()
var request = require('co-supertest').agent(server)

describe('Auth:', function() {
  after( function(done) {
    server.close()
    done()
  })

  describe('POST /auth/login -', function () {
    it('Should return a JWT', function(done) {
      co( function*() {
        var res;
        try{
          res = yield request
            .post('/api/v1/auth/login')
            .set('Content-Type', 'application/json')
            .send({
              email: process.env.USER_EMAIL,
              password: process.env.USER_PASSWORD
            })
            .end()
          var type = typeof res.body.token
          expect(type).toBe("string")
          expect(res.body.token.length).toBeGreaterThan(10)
          process.env.USER_TOKEN = res.body.token
          done()
        } catch (e) {
          console.error('Error: ', e)
          done(e)
        }
      })
    })
  })
})
