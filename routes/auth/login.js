'use strict'

module.exports = function(app) {
  var request = require('koa-request')
  var utilities = require(app.rootDir + '/lib/utilities')
  var Token = require(app.rootDir + '/lib/models/tokens')
  var User = require(__dirname + '/../users/model')

  /**
   * @swagger
   * /v1/auth/login:
   *  post:
   *    operationId: loginUserV1
   *    summary: Login User
   *    produces:
   *      - application/json
   *    parameters:
   *      - name: login
   *        in: body
   *        required: true
   *        description: Login user parameters
   *        schema:
   *          $ref: '#/definitions/Login'
   *    security:
   *      - Authorization:
   *        - write:users
   *    tags:
   *      - Auth
   *    responses:
   *      200:
   *        description: User logged out
   *        schema:
   *          $ref: '#/definitions/LoginResponse'
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
        try {
          var token = utilities.genToken(user)
          var refresh = utilities.genRefresh()
          yield Token.create({
            token: token,
            refresh: refresh,
            userId: user.id
          })
          return this.body =
          { token: token
          , refresh: refresh
          , type: 'bearer'
          }
        } catch (e) {
          throw e
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
   * definition:
   *   Login:
   *     required:
   *       - username
   *       - password
   *     properties:
   *       email:
   *         type: string
   *         description: Email address for user
   *       password:
   *         type: string
   *         description: Password for user
   *   LoginResponse:
   *     required:
   *       - jwt 
   *       - refresh 
   *       - type 
   *       - expires 
   *     properties:
   *       jwt:
   *         type: string
   *       refresh:
   *         type: string
   *       type:
   *         type: string
   *       expires:
   *         type: integer
   */

  return login
}
