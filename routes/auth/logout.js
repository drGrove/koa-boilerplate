'use strict';

module.exports = function(app) {
  // var genErr = require(app.rootDir + '/lib/error')
  var Token = require(app.rootDir + '/models').Token;

  /**
   * Log a user out
   * @return {object} body
   * @swagger
   * /auth/logout:
   *  get:
   *    operationId: logoutUserV1
   *    summary: Logout Current User
   *    produces:
   *      - application/json
   *    security:
   *      - Authorization: []
   *    tags:
   *      - Auth
   *    responses:
   *      200:
   *        description: User logged out
   */
  function *logout() {
    try {
      var token = yield Token.findOne({
        userId: this.auth.id,
        token: this.request.headers.authorization.split(' ')[1]
      });
      yield token.destroy();
      this.status = 200;
      this.body =
        { msg: 'Successfully logged out'
        };
    } catch (e) {
      this.status = 500;
      this.body =
        { error: true
        , msg: e.errors || e.message
        , errNo: 500
        , errCo: 'INTERNAL_SERVICE_ERROR'
        };
    }
    return this.body;
  }

  return logout;
};
