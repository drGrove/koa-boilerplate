'use strict'

module.exports = function(app) {
  var Token = require(app.rootDir + '/lib/models/tokens')
  var genErr = require(app.rootDir + '/lib/error')

  /**
   * @swagger
   * /auth/refresh:
   *   get:
   *     operationId: refreshAuthTokenV1
   *     summary: Refresh User Auth token
   *     produces:
   *       - application/json
   *     tags:
   *       - Auth
   *     security:
   *       - Authorization: []
   *     responses:
   *       200:
   *         description: Refresh and Bearer Token
   *         schema:
   *          $ref: '#/definitions/LoginResponse'
   *       403:
   *         description: Token Expiration
   *         schema:
   *          $ref: '#/definitions/TokenExpired'
   *       500:
   *        description: Internal Server Error
   *        schema:
   *          $ref: '#/definitions/InternalServerError'
   */
  function *refresh() {
    try {
      var token = yield Token.findOne({
        where:
        { userId: this.auth.id
        , token: this.request.headers.authorization.split(' ')[1]
        }
      })
      if(token) {
        yield token.destory()
      } else {
        throw new Error('TOKEN_EXPIRED')
      }
    } catch (e) {
      if(e.message === 'TOKEN_EXPIRED') {
        this.status = 403
        return this.body = genErr('TOKEN_EXPIRED')
      }
    }
  }

  return refresh
}
