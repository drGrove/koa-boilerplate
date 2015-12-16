'use strict'
var winston = require('winston')
const NODE_ENV = process.env.NODE_ENV || 'DEVELOPMENT'
const LOGGING = process.env.LOGGING || ''
winston.emitErrs = true

var transports = []

var fileTransport = new winston.transports
  .File
  ( { level: 'info'
    , filename: __dirname + '/../logs/all-logs.log'
    , handleExcpetions: true
    , json: true
    , maxsize: 5242880
    , maxFiles: 20
    , colorize: false
    }
  )

var consoleTransport = new winston.transports
  .Console
  ( { level: 'debug'
    , handleExcpetions: true
    , json: false
    , colorize: true
    }
  )

transports.push(fileTransport)
transports.push(consoleTransport)


var logger = new winston
  .Logger
  ( { transports: transports
    , exitOnError: false
    }
  )

module.exports = logger;
module.exports.stream =
  { write: function(message) {
      logger.info(message)
    }
  }
