'use strict';

module.exports = function(app) {
  var request = require('koa-request');
  var path = require('path');
  var jwt = require('jsonwebtoken');
  var config = require(path.join(app.rootDir, '/lib/config'));
  var genErr = require(path.join(app.rootDir, '/lib/error'));
  var utilities = require(path.join(app.rootDir, '/lib/utilities'))(app);
  var User = require(path.join(app.rootDir, '/models')).User;
  var Token = require(path.join(app.rootDir, '/models')).Token;

  /**
   * Authenticate with Google
   * @return {object} body
   * @swagger
   * /auth/google:
   *   get:
   *     operationId: googleAuthV1
   *     summary: Authenticate user via Google
   *     produces:
   *       - application/json
   *     tags:
   *       - Auth
   *     responses:
   *       200:
   *         description: Login via Google Successful
   *         $ref: '#/definitions/LoginResponse'
   */
  function *google() {
    var accessTokenUrl = 'https://accounts.google.com/o/oauth2/token';
    var peopleApiUrl = 'https://www.googleapis.com/plus/v1/people/me/' +
      'openIdConnect';
    var params =
      { code: this.request.body.code
      , client_id: this.request.body.clientId
      , client_secret: config.oauth.google.clientSecret
      , redirect_uri: this.request.body.redirectUri
      , grant_type: 'authorization_code'
      };
    var user;
    var token;
    var refresh;
    var payload;

    // Exchange authorization code for access token.
    var accessTokenRequest = yield request
      ( { method: 'POST'
        , url: accessTokenUrl
        , json: true
        , form: params
        }
      );
    var accessToken = accessTokenRequest.body.access_token;
    var headers =
      { Authorization: 'Bearer ' + accessToken
      };

    // Retrieve profile imformation about the current user
    var personApi = yield request
      ( { url: peopleApiUrl
        , method: 'GET'
        , headers: headers
        , json: true
        }
      );

    var profile = personApi.body;
    if (profile.error) {
      this.status = 500;
      this.body =
        { message: profile.error.message
        };
      return this.body;
    }

    // If the user is authed
    if (this.request.headers.authorization) {
      user = yield User.findOne({where: {google: profile.sub}});
      if (user) {
        this.status = 409;
        this.body =
          { msg: 'There is already a Google account that belongs to you'
          };
        return this.body;
      }

      token = this.request.headers.authorization.split(' ')[1];
      try {
        payload = jwt.verify(token, config.token_secret);
      } catch (e) {
        this.status = 401;
        this.body = genErr('NO_AUTH');
        return this.body;
      }

      user = yield User.findById(payload.sub);
      user.google = profile.sub;
      user.displayName = user.displayName || profile.name;
      try {
        yield user.save();
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
        this.body =
          { error: true
          , msg: 'Could not apply google id to user account'
          };
      }
    } else {
      // Create new user account or return an existing user
      user = yield User.findOne({google: profile.sub});
      if (user) {
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

      try {
        yield User.create
          ( { google: profile.sub
            , displayName: profile.name
            , email: profile.email
            , firstname: profile.given_name
            , lastname: profile.family_name
            , username: profile.profile.split('+')[1]
            }
          );
        user = yield User.findOne({where: {google: profile.sub}});
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
        this.body =
          { error: true
          , msg: 'Could not create user. Please try again'
          };
      }
    }
    return this.body;
  }

  return google;
};
