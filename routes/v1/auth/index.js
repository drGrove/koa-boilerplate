'use strict'
var config =
{ "POST":
  { "/login": login
  , "/logout": logout
  }
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
  this.body = [
    { username: 'dgrove'
    , jwt: 'dkaflkjakldjfd;lkajfd;klajf'
    }
  ]
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
function *logout(){
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

module.exports = config;
