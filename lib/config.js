/* jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
/* jscs:disable requireCapitalizedComments */
/* jshint -W106 */
'use strict'

var cfg;
try {
  cfg = require('../config.json')
} catch (e) {
  cfg = {}
}

var config =
{ app:
  { host:
      process.env.APP_HOST ||
      (cfg.app || {}).host ||
      'localhost'
  , port:
      process.env.APP_PORT ||
      (cfg.app || {}).port ||
      8889
  , namespace:
      process.env.APP_NS ||
      (cfg.app || {}).namespace ||
      '/'
  , domain:
      process.env.APP_DOMAIN ||
      (cfg.app || {}).domain ||
      this.app.host
  }
, token_secret:
    process.env.TOKEN_SECRET ||
    cfg.token_secret ||
    'YOUR SECRET'
, token_length:
    process.env.TOKEN_LENGTH ||
    cfg.token_length ||
    256
, mysql:
  { database:
      process.env.MYSQL_DATABASE ||
      (cfg.mysql || {}).database ||
      ''
  , username:
      process.env.MYSQL_USER ||
      (cfg.mysql || {}).username ||
      ''
  , password:
      process.env.MYSQL_PASSWORD ||
      (cfg.mysql || {}).password ||
      ''
  , host:
      process.env.MYSQL_HOST ||
      (cfg.mysql || {}).host ||
      ''
  , port:
      process.env.MYSQL_PORT ||
      (cfg.mysql || {}).port ||
      ''
  }
, mongodb:
  { database:
      process.env.MONGO_DATABASE ||
      (cfg.mongodb || {}).database ||
      ''
  }
, oauth:
  { google:
    { clientId:
        process.env.GOOGLE_CLIENT_ID ||
        ((cfg.oauth || {}).google || {}).clientId ||
        ''
    , clientSecret:
        process.env.GOOGLE_SECRET ||
        ((cfg.oauth || {}).google || {}).clientSecret ||
        ''
    }
  , facebook:
    { clientId:
        process.env.FACEBOOK_CLIENT_ID ||
        ((cfg.oauth || {}).facebook || {}).clientId ||
        ''
    , clientSecret:
        process.env.FACEBOOK_SECRET ||
        ((cfg.oauth || {}).facebook || {}).clientSecret ||
        ''
    }
  , github:
    { clientId:
        process.env.GITHUB_CLIENT_ID ||
        ((cfg.oauth || {}).github || {}).clientId ||
        ''
    , clientSecret:
        process.env.GITHUB_CLIENT_SECRET ||
        ((cfg.oauth || {}).github || {}).clientSecret ||
        ''
    }
  }
}

module.exports = config
