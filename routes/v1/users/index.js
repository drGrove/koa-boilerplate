'use strict'
module.exports = function(app){
  var User = require(__dirname + '/model')
  var ensureAuth = require(app.rootDir + '/lib/ensureAuth')

  var routeConfig =
  { "GET":
    { "/":
      [ all
      ]
    , "/:id":
      [ ensureAuth
      , byId
      ]
    }
  , "POST":
    { "/":
      [ ensureAuth
      , create
      ]
    }
  , "PUT":
    { "/:id":
      [ ensureAuth
      , update
      ]
    }
  , "DELETE":
    { "/:id":
      [ ensureAuth
      , remove
      ]
    }
  }

  return routeConfig;

  /**
   * @swagger
   * /v1/users:
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
    try {
      var users = JSON.parse(
          JSON.stringify(
            yield User.findAll({})
          )
        )
      for (var i = 0; i < users.length; i++) {
        delete users[i].password;
      }
      this.status = 201
      return this.body = users
    } catch (e) {
      console.error('Error: ', e.stack || e)
      this.status = 500
      return this.body =
      { error: true
      , msg: 'Error returning users'
      , develeoperMsg: e.message
      }
    }
  }
  /**
   * @swagger
   * /v1/users:
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
    var body = this.request.body
    body.level = 1;
    try {
      var res = yield User.create(body);
      console.log('Res: ', res)
      this.status = 201
      delete res.password
      return this.body = res;
    } catch (e) {
        this.status = 400;
        return this.body =
        { error: true
        , msg: e.errors || 'Invalid Input'
        }
      /*
      } else {
        console.error('Error: ', e)
        this.status = 400;
        return this.body =
        { error: true
        , msg: 'Error creating user'
        , develeoperMsg: e.message
        }
      }
      */
    }
    this.body = body
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
    console.log('ID: ', this.params.id)
    try {
      var user = JSON.parse(
          JSON.stringify(
            yield User.findById(
              this.params.id
            )
          )
        )
      delete user.password
      this.body = user
    } catch (e) {
      switch(e.name) {
        case "TypeError":
          this.status = 404;
          break;
        default:
          this.status = 500
          this.body =
          { error: true
          , msg: e.message
          }
      }
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
    try {
      var user = yield User.findById(this.params.id)
      user.isActive = false
      yield user.save()
      yield user.destroy()
      return this.status = 204
    } catch (e) {
      this.status = 500
      this.body =
      { error: true
      , msg: e.errors || e.message
      }
    }
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
    var body = this.request.body
    try {
      var user = yield User.findById(this.params.id)
      if(!user) {
        var user = yield User.find({
          where: {id: this.params.id},
          paranoid: false
        })
      }
      for(let key in body) {
        if(body.hasOwnProperty(key) && key !== "id") {
          user[key] = body[key]
        }
      }
      if(user.deletedAt && user.isActive) {
        yield user.restore()
      }
      yield user.save()
      user = JSON.parse(JSON.stringify(user))
      delete user.password
      return this.body = user
    } catch (e) {
      console.error('Error: ', e.stack)
      this.status = 500
      this.body =
      { error: true
      , msg: e.errors || e.message
      }
    }
  }
}
