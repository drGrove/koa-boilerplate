'use strict'

'use strict'
try {
  var cfg = require('../config.json')
} catch (e) {
  var cfg = {}
}

var config =
{ app:
  { host: process.env.APP_HOST || (cfg.app || {}).host || 'localhost'
  , port: process.env.APP_PORT || (cfg.app || {}).port || 8889
  , namespace: process.env.APP_NS || (cfg.app || {}).namespace || '/api'
  , domain: process.env.APP_DOMAIN || (cfg.app || {}).domain || this.app.host
  }
, token_secret: process.env.TOKEN_SECRET || cfg.token_secret || 'YOUR SECRET'
, token_length: process.env.TOKEN_LENGTH || cfg.token_length || 256
, mysql:
  { database: process.env.MYSQL_DATABASE || (cfg.mysql || {}).database || ''
  , username: process.env.MYSQL_USER || (cfg.mysql || {}).username || ''
  , password: process.env.MYSQL_PASSWORD || (cfg.mysql || {}).password || ''
  , host: process.env.MYSQL_HOST || (cfg.mysql || {}).host || ''
  , port: process.env.MYSQL_PORT || (cfg.mysql || {}).port || ''
  }
, mongodb:
  { database: process.env.MONGO_DATABASE || (cfg.mongodb || {}).database || ''
  }
}

module.exports = config
