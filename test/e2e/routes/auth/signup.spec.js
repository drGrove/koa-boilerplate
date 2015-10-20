'use strict'
var expect = require('expect')
var app = require(process.env.PROJECT_ROOT + '/index')
var co = require('co')
var server = app.listen()
var request = require('co-supertest').agent(server)

var userBody =
{ email: process.env.USER_EMAIL
, password: process.env.USER_PASSWORD
, firstname: 'Jonny'
, lastname: 'Testerson'
}

describe('SignUp:', function() {
  after( function(done) {
    server.close()
    done()
  })

  describe('POST /auth/signup', function() {
    var res;

    before( function(done) {
      co( function*() {
        res = yield request
          .post('/api/v1/auth/signup')
          .send(userBody)
          .end()
        done()
      })
    })

    it('Should return JWT Token', function(done) {
      expect(res.body).toBeA('object')
      expect(res.body.token.length).toBeGreaterThan(10)
      process.env.USER_TOKEN = res.body.token
      done()
    })

  })
})
