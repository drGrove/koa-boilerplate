'use strict'

var config =
{ "GET":
  { "/": all
  , "/:id": byId
  }
, "POST":
  { "/": create
  }
, "PUT":
  { "/:id": update
  }
, "DELETE":
  { "/:id": remove
  }
}

module.exports = config;

/**
 * @swagger
 * /v1/users/:
 *  get:
 *    operationId: listUsersV1
 *    summary: List Users
 *    produces:
 *     - application/json
 *    tags:
 *     - Users
 *    responses:
 *      200:
 *        description: Users get all
 *        schema:
 *          type: array
 *          items:
 *            $ref: '#/definitions/User'
 */
function *all() {
  this.body = [
    { username: 'dgrove'
    },
    { username: 'jsmith'
    }
  ]
}
/**
 * @swagger
 * /v1/users/:
 *   post:
 *     operationId: createUsersV1
 *     summary: Creates a new User.
 *     produces:
 *      - application/json
 *     tags:
 *      - Users
 *     parameters:
 *       - name: User
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/User'
 *     responses:
 *       200:
 *         description: Creates a user
 *         schema:
 *           $ref: '#/definitions/User'
 */
function *create() {
  this.body = [
    { username: 'jsmith'
    }
  ]
}


/**
 * @swagger
 * /v1/users/{id}:
 *   get:
 *     operationId: listUserByIdV1
 *     summary: List User by id
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of user to fetch
 *         required: true
 *         type: integer
 *         format: int64
 *     tags:
 *      - Users
 *     responses:
 *       200:
 *         description: Users by ID
 *         schema:
 *           $ref: '#/definitions/User'
 */
function *byId() {
  this.body =
  { username: 'jsmith'
  }
}

/**
 * @swagger
 * /v1/users/{id}:
 *   delete:
 *     operationId: deleteUserV1
 *     summary: Remove User by id
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of user to delete
 *         type: integer
 *         format: int64
 *     tags:
 *       - Users
 *     responses:
 *       204:
 *         description: Delete user by id
 */
function *remove() {
  this.status = 204
}

/**
 * @swagger
 * /v1/users/{id}:
 *   put:
 *     operationId: updateUserV1
 *     summary: Update user by id
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of user to update
 *         type: integer
 *         format: int64
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Update user by id
 *         schema:
 *           $ref: '#/definitions/User'
 */
function *update() {
  this.status = 200
  this.body =
  { username: 'jsmith'
  }
}
