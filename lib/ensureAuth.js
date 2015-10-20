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
var User = require(app.rootDir + '/routes/users/model')(app)
var Role = require(app.rootDir + '/routes/roles/model')(app)
var Route = require(app.rootDir + '/routes/routes/model')(app)
var logger = require(app.rootDir + '/lib/logger')
var UserRole = require(__dirname + '/models/userRoles')
var checkRole = require(__dirname + '/checkRole')
var genErr = require(__dirname + '/error')
var Token = require(__dirname + '/models/tokens')

User
  .belongsToMany
  ( Role
  , { through:
      { model: UserRole
      , foreignKey: 'userId'
      }
    }
  )
Role
  .belongsToMany
  ( User
  , { through:
      { model: UserRole
      , foreignKey: 'roleId'
      }
    }
  )




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

  if (payload.exp <= Date.now() &&
      whitelist.indexOf(token) === -1
     ) {
    this.status = 401;
    this.body = genErr('TOKEN_EXPIRED')
    return
  }

  try {
    var user = yield User
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
    logger.error('Error pulling user.', e)
    this.status = 500
    this.body =  genErr('NO_AUTH')
    return this.body
  }

  user = JSON.parse(JSON.stringify(user))

  delete user.password
  this.auth =  user
  try {
    var doesPass = yield checkRole.apply(this)
    if (doesPass === true) {
      // Convert 'Me' to the user id
      if (this.params.id === 'me') {
        this.params.id = this.auth.id
      }
      logger.info('USER ID:' + this.params.id)
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
