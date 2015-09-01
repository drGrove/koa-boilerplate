'use strict'

var User = require(__dirname + '/../users/model')
var config = require(__dirname + '/../../../lib/config')
var jwt = require('jsonwebtoken')

var routeConfig =
{ "POST":
  { "/login": login
  , "/logout": logout
  }
}

/**
 * @name createJWT
 * @function
 * @param {Object} user - The current user
 * @returns {Object} jwt - Signed JWT Token
 */
function createJWT(user) {
  var now = Date.now()
  // Expire in 14 days
  var expires = now + (1000 * 60 * 60 * 24 * 14)
  var mins = (expires - now) / 1000 / 60
  var payload =
  { sub: user.id
  , iat: now
  , exp: expires
  }
  return jwt
    .sign
    ( payload
    , config.token_secret
    , mins
    )
}


/**
 * @swagger
 * /v1/auth/login:
 *   post:
 *     operationId: loginUserV1
 *     summary: Login User
 *     produces:
 *      - application/json
 *     tags:
 *      - Auth
 *     responses:
 *       200:
 *         description: User logged in
 *         schema:
 *           type: object
 *           $ref: '#/definitions/Login'
 */
function *login() {
  var body = this.request.body
  try {
    let user = yield User
      .findOne
      ( { email: body.email
        }
      )
    var isMatch = user.validPassword(body.password)
    if(isMatch) {
      return this.body = 
      { token: createJWT(user)
      }
    } else {
      throw new Error('Invalid email/password combination')
    }
  } catch (e) {
    this.status = 400
    this.body =
    { error: true
    , msg: e.message
    }
  }
}

/**
 * @swagger
 * /v1/auth/logout:
 *  post:
 *    operationId: logoutUserV1
 *    summary: Logout Current User
 *    produces:
 *      - application/json
 *    tags:
 *      - Auth
 *    responses:
 *      200:
 *        description: User logged out
 */
function *logout() {
  this.body =
  { success: true
  }
}

/**
 * @swagger
 * definition:
 *   Login:
 *     required:
 *       - username
 *       - password
 *     properties:
 *       username:
 *         type: string
 *       password:
 *         type: string
 */

module.exports = routeConfig;
