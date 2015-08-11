'use strict'

'use strict'
try {
  var cfg = require('../config.json')
} catch(e) {
  var cfg = {}
}

var config =
{ app:
  { host: process.env.APP_HOST || (cfg.app || {}).host || 'localhost'
  , port: process.env.APP_PORT || (cfg.app || {}).port || 8889
  , namespace: process.env.APP_NS || (cfg.app || {}).namespace || '/api'
  }
}

module.exports = config
