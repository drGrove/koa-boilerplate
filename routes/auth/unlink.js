'use strict';

module.exports = function(app) {
  var User = require(app.rootDir + '/models').User;

  /**
   * Unlink a provider
   * @return {object} body
   */
  function *unlink() {
    var provider = this.request.body.provider;
    var providers =
      [ 'facebook'
      // , 'foursquare'
      , 'google'
      , 'github'
      // , 'instagram'
      // , 'linkedin'
      // , 'live'
      // , 'twitter'
      // , 'twitch'
      // , 'yahoo'
      ];

    if (providers.indexOf(provider) === -1) {
      this.status = 400;
      this.body =
        { error: true
        , errNo: 400
        , errCode: 'INVALID_REQUEST'
        , msg: 'Invalid OAuth Provider supplied'
        };
      return this.body;
    }
    var user = yield User.findById(this.auth.id);
    if (!user) {
      this.status = 400;
      this.body =
        { error: true
        , errCode: 'NOT_FOUND'
        , errNo: 404
        , msg: 'User Not Found'
        };
      return this.body;
    }

    user[provider] = undefined;

    try {
      yield user.save();
      user = JSON.parse(JSON.stringify(user));
      delete user.password;
      this.status = 200;
      this.body = user;
    } catch (e) {
      this.status = 500;
      this.body =
        { error: true
        , errCode: 'INTERNAL_SERVER_ERROR'
        , errNo: 500
        , msg: 'Could not unlink account'
        };
    }
    return this.body;
  }

  return unlink;
};
