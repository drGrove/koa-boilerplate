'use strict';
module.exports = function(app) {
  var genError = require(app.rootDir + '/lib/error');
  var ensureAuth = require(app.rootDir + '/lib/ensureAuth');
  var logger = require(app.rootDir + '/lib/logger');
  var Route = require(app.rootDir + '/models').Route;
  var Role = require(app.rootDir + '/models').Role;

  var routeConfig =
  { POST:
    { '/': create
    }
  , GET:
    { '/': all
    , '/:id': byId
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
   * Create a route reference
   * @return {object} body
   * @swagger
   * /routes:
   *  post:
   *    operationId: createRouteReferenceV1
   *    summary: Create a reference to a route for role based endpoints
   *    produces:
   *      - application/json
   *    tags:
   *      - Routes
   *    responses:
   *      200:
   *        description: Success
   *        schema:
   *          type: object
   *          $ref: '#/definitions/newRoute'
   */
  function *create() {
    var body = this.request.body;
    try {
      var routeBody =
        { url: body.url
        , method: body.method
        };
      delete body.url;
      delete body.method;
      var route;
      try {
        route = yield Route.create(routeBody);
      } catch (e) {
        logger.error('Error: ', e);
        route = yield Route.findOne({
          where: routeBody,
          include: [Role]
        });
      }
      var role = yield Role.findById(body.role);
      yield role.addRoute(route);
      this.status = 201;
      this.body = route;
    } catch (e) {
      logger.error('Error: ', e);
      switch (e.name) {
        case 'SequelizeUniqueConstraintError': {
          logger.error('Error: ', e);
          this.status = 400;
          this.body =
            { error: true
            , msg: e.errors || e.message
            , errNo: 420
            , errCode: 'UniqueConstraint'
            };
          break;
        }
        default: {
          // do nothing
        }
      }
    }
    return this.body;
  }

  /**
   * Get a route by reference
   * @return {object} body
   * @swagger
   * /routes:
   *   get:
   *     operationId: getRoutesReferenceV1
   *     summary: Returns list of routes with roles
   *     produces:
   *       - application/json
   *     tags:
   *       - Routes
   *     responses:
   *       200:
   *         description: Array of Routes
   *         schema:
   *          type: array
   *          items:
   *            $ref: '#/definitions/route'
   */
  function *all() {
    try {
      var res = yield Route.findAll({});
      this.body = res;
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
   * Get a route by id
   * @return {object} body
   */
  function *byId() {
    var id = this.params.id;
    try {
      this.body = yield Route.findById(id);
    } catch (e) {
      this.status = 404;
      this.body =
        { error: true
        , msg: 'Item not found'
        };
    }
    return this.body;
  }

  /**
   * Update a route by id
   * @return {object} body
   */
  function *update() {
    var id = this.params.id;
    var body = this.request.body;
    try {
      var route = yield Route.findById(id);
      for (var key in body) {
        if (route.hasOwnProperty(key)) {
          route[key] = body[key];
        }
      }
      yield route.save();
      this.body = route;
    } catch (e) {
      this.status = 400;
      this.body =
        { error: true
        , msg: e.errors || e.message
        , errNo: 400
        , errCode: 'INVALID_PARAMETERS'
        };
    }
    return this.body;
  }

  /**
   * Delete a route by id
   * @return {object} body
   */
  function *remove() {
    var id = this.params.id;
    try {
      var route = yield Route.findById(id);
      yield route.destroy();
      this.status = 204;
      this.body = genError('NO_CONTENT');
    } catch (e) {
      this.status = 500;
      this.body =
        { error: true
        , msg: e.errors || e.message
        };
    }
    return this.body;
  }
};
