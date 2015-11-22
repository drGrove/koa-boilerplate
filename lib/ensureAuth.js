/* jscs:disable requireCamelCaseOrUpperCaseIdentifiers
/* jscs:disable requireCapitalizedComments */
/* jshint -W106 */
'use strict'
var rootDir = __dirname.split('/')
rootDir.pop()
rootDir = rootDir.join('/')
var app =
{ rootDir: rootDir
}
var jwt = require('jsonwebtoken')
var config = require(__dirname + '/config')
var checkRole = require(__dirname + '/checkRole')
var genErr = require(app.rootDir + '/lib/error')
var logger = require(app.rootDir + '/lib/logger')
var User = require(app.rootDir + '/models').User
var Role = require(app.rootDir + '/models').Role
var Token = require(app.rootDir + '/models').Token
var Route = require(app.rootDir + '/models').Route

/**
 * @swagger
 * securityDefinition:
 *   Authorization:
 *     type: apiKey
 *     name: Authorization
 *     in: header
 *     description: Bearer Token
 */
function *ensureAuth(next) {
  var request = this.request
  if (!request.headers.authorization) {
    this.status = 401
    this.body = genErr('NO_AUTH')
    return
  }

  var token = request.headers.authorization.split(' ')[1]
  var payload = null
  try {
    payload = jwt.verify(token, config.token_secret)
  } catch (err) {
    logger.error('Error:', err.message)
    this.status = 401
    this.body = genErr('NO_AUTH')
    return
  }

  var whitelist = yield Token.find({
    userId: payload.sub
  })

  if (!whitelist) {
    this.status = 401
    this.body = genErr('NO_AUTH')
    return this.body
  }

  if ( payload.exp <= Date.now() &&
       whitelist.indexOf(token) === -1
     ) {
    this.status = 401;
    this.body = genErr('TOKEN_EXPIRED')
    return this.body
  }

  var user;
  try {
    user = yield User
      .findById
      ( payload.sub
      , { include:
          [ { model: Role
            , include:
              [ Route
              ]
            }
          ]
        }
      )
  } catch (e) {
    logger.error('Error pulling user.', e.errors || e.message || e)
    this.status = 500
    this.body =  genErr('NO_AUTH')
    return this.body
  }

  user = JSON.parse(JSON.stringify(user))
  // Delete password from object
  delete user.password

  this.auth =  user
  try {
    var doesPass = yield checkRole.apply(this)
    if (doesPass === true) {
      // Convert 'Me' to the user id
      if (this.params.id === 'me') {
        this.params.id = this.auth.id
      }
      yield next
    } else {
      throw new Error('IP')
    }
  } catch (e) {
    if (e.message === 'IP') {
      this.status = 403
      this.body = genErr('INSUFFICENT_PERMISSIONS')
      return this.body
    } else {
      throw e
    }
  }
}

module.exports = ensureAuth
