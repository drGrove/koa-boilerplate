'use strict';

module.exports = function(app) {
  var request = require('koa-request');
  var jwt = require('jsonwebtoken');
  var expect = require('expect');
  var config = require(app.rootDir + '/lib/config');
  var utilities = require(app.rootDir + '/lib/utilities');
  var genErr = require(app.rootDir + '/lib/error');
  var User = require(app.rootDir + '/models').User;
  var Token = require(app.rootDir + '/models').Token;

  /**
   * Attempt to sign up/pair account with linkedin
   * @return {object} body
   * @swagger
   *  /auth/linkedin:
   *    get:
   *      operationId: linkedinAuthV1
   *      summary: Authenticate user via LinkedIn
   *      produces:
   *        - application/json
   *      tags:
   *        - Auth
   *      responses:
   *        200:
   *          description: Login via LinkedIn Successful
   *          $ref: '#/definitions/LoginResponse'
   *
   */
  function *linkedin() {
    const accessTokenUrl = 'https://www.linkedin.com/uas/oauth2/accessToken';
    const peopleApiUrl = config.oauth.linkedin.peopleApiUrl;

    // Attempt to receive access token from LinkedIn
    const accessTokenParams =
      { code: this.request.body.code
      , client_id: this.request.body.clientId
      , client_secret: config.oauth.linkedin.clientSecret
      , redirect_uri: this.request.body.redirectUri
      , grant_type: 'authorization_code'
      };
    var accessTokenResponse;
    var token;
    var user;
    var refresh;
    var profileResponse;

    try {
      accessTokenResponse = yield request
        ( { url: accessTokenUrl
          , method: 'POST'
          , form: accessTokenParams
          , json: true
          }
        );
      expect(accessTokenResponse.statusCode).toBe(200);
    } catch (e) {
      this.status = accessTokenResponse.statusCode || 500;
      this.body =
        { error: true
        , errNo: 500
        , errCode: 'EXTERNAL_SERVICE_ISSUE'
        , msg:
            accessTokenResponse.body.errer_description ||
            'Could not connect to Linkedin'
        };

      return this.body;
    }
    // Retrieve profile information about the current user
    try {
      const peopleApiParams =
        { oauth2_access_token: accessTokenResponse.body.access_token
        , format: 'json'
        };
      profileResponse = yield request
        ( { url: peopleApiUrl
          , qs: peopleApiParams
          , json: true
          }
        );

      expect(profileResponse.statusCode).toBe(200);
    } catch (e) {
      this.status = 500;
      this.body =
        { error: true
        , errNo: 500
        , errCode: 'EXTERNAL_SERVICE_ISSUE'
        , msg: 'Could not retrieve profile from LinkedIn'
        };

      return this.body;
    }

    var profile = profileResponse.body;
    var existingUser = yield User.findOne
      ( { where:
          { $or:
            [ { linkedin: profile.id
              }
            , { email: profile.emailAddress
              }
            ]
          }
        }
      );

    if (existingUser) {
      this.status = 409;
      this.body =
        { error: true
        , errNo: 409
        , errCode: 'AUTH_EXISTS_LINKEDIN'
        , msg: 'There is already a user with this LinkedIn account.'
        };
      return this.body;
    }

    // If Authenticated
    if (this.request.headers.authorization) {
      // var authToken = this.request.headers.authorization.split(' ')[1];
      var payload = jwt.verify(token, config.token_secret);
      user = yield User.findById(payload.sub);

      if (!user) {
        this.status = 400;
        this.body =
          { error: true
          , errNo: 400
          , errCode: 'NOT_FOUND'
          , msg: 'User not found'
          };
      }

      user.linkedin = profile.id;
      try {
        yield user.save();
        this.status = 200;
        token = utilities.genToken(user);
        refresh = utilities.genRefresh();
        yield Token
          .create
          ( { token: token
            , refresh: refresh
            , userId: user.id
            }
          );
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
      // If un-authenticate: create new user
      yield User
        .create
          ( { linkedin: profile.id
            , displayName: profile.firstName
            , firstname: profile.firstName
            , lastname: profile.lastName
            , email: profile.emailAddress
            }
          );

      user = User
        .fineOne
        ( { where:
            { linkedin: profile.id
            }
          }
        );

      token = utilities.genToken(user);
      refresh = utilities.genRefresh();
      yield Token
        .create
          ( { token: token
            , refresh: refresh
            , userId: user.id
            }
          );

      this.body =
        { token: token
        , refresh: refresh
        , type: 'bearer'
        };
    }

    return this.body;
  }

  return linkedin;
};
