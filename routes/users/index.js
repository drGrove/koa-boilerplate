'use strict';
module.exports = function(app) {
  var ensureAuth = require(app.rootDir + '/lib/ensureAuth');
  var logger = require(app.rootDir + '/lib/logger');
  var User = require(app.rootDir + '/models').User;

  var routeConfig =
  { GET:
    { '':
      [ ensureAuth
      , all
      ]
    , '/:id':
      [ ensureAuth
      , byId
      ]
    }
  , POST:
    { '/':
      [ ensureAuth
      , create
      ]
    }
  , PUT:
    { '/:id':
      [ ensureAuth
      , update
      ]
    }
  , DELETE:
    { '/:id':
      [ ensureAuth
      , remove
      ]
    }
  };

  return routeConfig;

  /**
   * Get A list of the Users
   * @return {object} body
   * @swagger
   * /users:
   *  get:
   *    operationId: listUsersV1
   *    summary: List Users
   *    produces:
   *     - application/json
   *    tags:
   *     - Users
   *    security:
   *     - Authorization: []
   *    responses:
   *      200:
   *        description: Users get all
   *        schema:
   *          type: array
   *          items:
   *            $ref: '#/definitions/User'
   */
  function *all() {
    var attributes = {};

    if (this.auth) {
      logger.log('Auth:', this.auth);
    }

    try {
      var users = JSON.parse(
          JSON.stringify(
            yield User
              .findAll
                ( attributes
                )
          )
        );
      for (var i = 0; i < users.length; i++) {
        delete users[i].password;
      }
      this.status = 200;
      this.body = users;
    } catch (e) {
      logger.error('Error: ', e.stack || e);
      this.status = 500;
      this.body =
        { error: true
        , msg: 'Error returning users'
        , develeoperMsg: e.message
        };
    }
    return this.body;
  }

  /**
   * Create a new user
   * @return {object} body
   * @swagger
   * /users:
   *   post:
   *     operationId: createUsersV1
   *     summary: Creates a new User.
   *     produces:
   *      - application/json
   *     tags:
   *      - Users
   *     security:
   *       - Authorization: []
   *     parameters:
   *       - name: User
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/NewUser'
   *     responses:
   *       200:
   *         description: Creates a user
   *         schema:
   *           $ref: '#/definitions/User'
   */
  function *create() {
    var body = this.request.body;
    body.level = 1;
    try {
      var res = yield User.create(body);
      logger.log('Res: ', res);
      this.status = 201;
      delete res.password;
      this.body = res;
    } catch (e) {
      this.status = 400;
      this.body =
        { error: true
        , msg: e.errors || 'Invalid Input'
        };
    }
    return this.body;
  }

  /**
   * List a user by id
   * @return {object} body
   * @swagger
   * /users/{id}:
   *   get:
   *     operationId: listUserByIdV1
   *     summary: List User by id
   *     parameters:
   *       - name: id
   *         in: path
   *         type: integer
   *         required: true
   *         description: ID of user to fetch
   *     tags:
   *      - Users
   *     responses:
   *       200:
   *         description: Users by ID
   *         schema:
   *           $ref: '#/definitions/User'
   */
  function *byId() {
    if (this.params.id === 'me') {
      yield me(this);
    } else {
      try {
        var user = JSON.parse(
            JSON.stringify(
              yield User.findById(
                this.params.id
              )
            )
          );
        delete user.password;
        this.body = user;
      } catch (e) {
        switch (e.name) {
          case 'TypeError':
            this.status = 404;
            break;
          default:
            this.status = 500;
            this.body =
            { error: true
            , msg: e.message
            };
        }
      }
    }
    return this.body;
  }

  /**
   * Update a user by id
   * @return {object} body
   * @swagger
   * /users/{id}:
   *   put:
   *     operationId: updateUserV1
   *     summary: Update user by id
   *     tags:
   *       - Users
   *     security:
   *       - Authorization: []
   *     parameters:
   *       - name: id
   *         in: path
   *         type: integer
   *         required: true
   *         description: User ID
   *     responses:
   *       200:
   *         description: Update user by id
   *         schema:
   *           $ref: '#/definitions/User'
   */
  function *update() {
    var body = this.request.body;
    try {
      var user = yield User.findById(this.params.id);
      if (!user) {
        user = yield User.find({
          where: {id: this.params.id},
          paranoid: false
        });
      }
      for (let key in body) {
        if (body.hasOwnProperty(key) && key !== 'id') {
          user[key] = body[key];
        }
      }
      if (user.deletedAt && user.isActive) {
        yield user.restore();
      }
      yield user.save();
      user = JSON.parse(JSON.stringify(user));
      delete user.password;
      this.body = user;
    } catch (e) {
      logger.error('Error: ', e.stack);
      this.status = 500;
      this.body =
        { error: true
        , msg: e.errors || e.message
        };
    }
    return this.body;
  }

  /**
   * Delete a user by id
   * @return {object} body
   * @swagger
   * /users/{id}:
   *   delete:
   *     operationId: deleteUserV1
   *     summary: Remove User by id
   *     tags:
   *       - Users
   *     parameters:
   *       - name: id
   *         type: integer
   *         in: path
   *         required: true
   *         description: User ID
   *     security:
   *       - Authorization: []
   *     responses:
   *       204:
   *         description: Delete user by id
   */
  function *remove() {
    try {
      var user = yield User.findById(this.params.id);
      logger.log('User: ', user);

      if (!user) {
        this.status = 404;
        return this.body;
      }

      user.isActive = false;
      yield user.save();

      yield User
        .destroy
        ( { where:
            { id: this.params.id
            }
          }
        );

      this.status = 204;
      this.body = '';
    } catch (e) {
      this.status = 500;
      this.body =
      { error: true
      , msg: e.errors || e.message
      };
    }
    return this.body;
  }

  /**
   *  Get the user
   *  @param {object} that koa this reference
   *  @return {object} body
   *  @swagger
   *  /users/me:
   *    get:
   *      operationId: getMeV1
   *      summary: Get the current logged in user information
   *      tags:
   *        - Users
   *      security:
   *        - Authorization: []
   *      responses:
   *        200:
   *          description: User object
   *          $ref: '#/definitions/User'
   *        401:
   *          description: Not Authorized
   *          $ref: '#/definitions/GeneralError'
   */
  function *me(that) {
    var user = JSON.parse(
      JSON.stringify(
        yield User.findById(that.auth.id)
      )
    );

    delete user.password;
    that.body = user;
    return that;
  }
};
