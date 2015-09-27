/* jscs:disable requireCamelCaseOrUpperCaseIdentifiers
/* jscs:disable requireCapitalizedComments */
/* jshint -W106 */
'use strict'
var jwt = require('jsonwebtoken')
var config = require(__dirname + '/config')
var User = require(__dirname + '/../routes/users/model')
var Role = require(__dirname + '/../routes/roles/model')
var Route = require(__dirname + '/../routes/routes/model')
var checkRole = require(__dirname + '/checkRole')
var genErr = require(__dirname + '/error')
var Token = require(__dirname + '/models/tokens')

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
    console.error('Error:', err.message)
    this.status = 401
    this.body = genErr('NO_AUTH')
    return
  }

  var whitelist = yield Token.find({
    userId: payload.sub
  })

  if (payload.exp <= Date.now() &&
      whitelist.indexOf(token) === -1
     ) {
    this.status = 401;
    this.body = genErr('TOKEN_EXPIRED')
    return
  }

  var user = JSON.parse(
    JSON.stringify(
      yield User
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
    )
  )

  delete user.password
  this.auth =  user

  try {
    var doesPass = yield checkRole.apply(this)
    if (doesPass === true) {
      yield next
    } else {
      throw new Error('IP')
    }
  } catch (e) {
    if (e.message === 'IP') {
      this.status = 403
      this.body = genErr('INSUFFICENT_PERMISSIONS')
      return
    } else {
      throw e
    }
  }
}

module.exports = ensureAuth
