'use strict';

module.exports = function(app) {
  var request = require('koa-request');
  var qs = require('querystring');
  var path = require('path');
  var jwt = require('jsonwebtoken');
  var config = require(path.join(app.rootDir, '/lib/config'));
  var utilities = require(path.join(app.rootDir, '/lib/utilities'));
  var genErr = require(path.join(app.rootDir, '/lib/error'));
  var logger = require(path.join(app.rootDir, '/lib/logger'));
  var User = require(path.join(app.rootDir, '/models')).User;
  var Token = require(path.join(app.rootDir, '/models')).Token;

  /**
   * Auth with facebook or link to account
   * @return {object} body
   * @swagger
   * /auth/facebook:
   *   get:
   *     operationId: facebookAuthV1
   *     summary: Authenticate user via Facebook
   *     produces:
   *       - application/json
   *     tags:
   *       - Auth
   *     responses:
   *       200:
   *         description: Login via Facebook Successful
   *         $ref: '#/definitions/LoginResponse'
   */
  function *facebook() {
    var accessTokenUrl = 'https://graph.facebook.com/v2.4/oauth/access_token';
    var graphApiUrl = 'https://graph.facebook.com/v2.4/me';
    var params =
      { code: this.request.body.code
      , client_id: this.request.body.clientId
      , client_secret: config.oauth.facebook.clientSecret
      , redirect_uri: this.request.body.redirectUri
      };
    var user;
    var existingUser;
    var token;
    var refresh;
    var payload;

    var accessTokenResponse = yield request
      ( { url: accessTokenUrl
        , method: 'GET'
        , qs: params
        , json: true
        }
      );

    if (accessTokenResponse.statusCode !== 200) {
      logger.error('Error connecting to facebook - access token');
      this.status = 500;
      this.body =
        { error: true
        , errNo: 500
        , errCode: "EXTERNAL_SERVICE_ISSUE"
        , msg: "Could not connect to Facebook"
        };
      return this.body;
    }

    var accessToken = qs.parse(accessTokenResponse.body).access_token;

    var profileResponse = yield request
      ( { url: graphApiUrl
        , method: 'GET'
        , qs:
          { access_token: accessToken
          , fields: 'email,name'
          }
        , json: true
        }
      );

    if (profileResponse.statusCode !== 200) {
      logger.error('Error connecting to facebook - profile');
      this.status = 500;
      this.body =
        { error: true
        , errNo: 500
        , errCode: "EXTERNAL_SERVICE_ISSUE"
        , msg: "Could not connect to Facebook"
        };
      return this.body;
    }

    var profile = profileResponse.body;

    if (this.request.headers.authorization) {
      // If user logged in.
      user = yield User.findOne({
        where:
        { facebook: profile.id
        }
      });

      if (user) {
        this.status = 409;
        this.body =
          { error: true
          , errNo: 409
          , errCode: 'AUTH_EXISTS'
          , msg: 'There is already a Facebook account that belongs to you'
          };
        return this.body;
      }

      token = this.request.headers.authorization.split(' ')[1];
      payload = jwt.verify(token, config.token_secret);
      user = yield User.findById(payload.sub);

      if (!user) {
        this.status = 400;
        this.body =
          { error: true
          , errNo: 400
          , errCode: "NOT_FOUND"
          , msg: "User not found"
          };
        return this.body;
      }

      user.facebook = profile.id;
      user.displayName = user.displayName || profile.name;
      try {
        yield user.save();
        this.status = 200;
        token = utilities.genToken(user);
        refresh = utilities.genRefresh();
        yield Token.create({
          token: token,
          refresh: refresh,
          userId: user.id
        });
        this.body =
          { token: token
          , refresh: refresh
          , type: 'bearer'
          };
      } catch (e) {
        this.status = 500;
        this.body = genErr('INTERNAL_SERVER_ERROR');
      }
    } else {
      // Create a new user or return existing
      existingUser = yield User.findOne({
        where:
        { facebook: profile.id
        }
      });

      if (existingUser) {
        token = utilities.genToken(user);
        refresh = utilities.genRefresh();
        yield Token.create({
          token: token,
          refresh: refresh,
          userId: user.id
        });
        this.body =
          { token: token
          , refresh: refresh
          , type: 'bearer'
          };
        return this.body;
      }

      user = yield User.create({
        facebook: profile.id,
        displayName: profile.name,
        firstname: profile.name.split(' ')[0],
        lastname: profile.name.split(' ')[1],
        email: profile.email
      });

      user = yield User.findOne({
        where:
        { facebook: profile.id
        }
      });

      token = utilities.genToken(user);
      refresh = utilities.genRefresh();

      yield Token.create({
        token: token,
        refresh: refresh,
        userId: user.id
      });

      this.body =
        { token: token
        , refresh: refresh
        , type: 'bearer'
        };
    }
    return this.body;
  }

  return facebook;
};
