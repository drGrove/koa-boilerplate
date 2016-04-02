'use strict';
var winston = require('winston');
var path = require('path');
winston.emitErrs = true;

var transports = [];

var fileTransport = new winston.transports
  .File
  ( { level: 'info'
    , filename: path.join(__dirname, '/../logs/all-logs.log')
    , handleExcpetions: true
    , json: true
    , maxsize: 5242880
    , maxFiles: 20
    , colorize: false
    }
  );

var consoleTransport = new winston.transports
  .Console
  ( { level: 'debug'
    , handleExcpetions: true
    , json: false
    , colorize: true
    }
  );

transports.push(fileTransport);
transports.push(consoleTransport);

var logger = new winston
  .Logger
  ( { transports: transports
    , exitOnError: false
    }
  );

/**
 * Write Message to logger
 * @param {string} message the message you want to write to the logger
 */
var writeMessage = function(message) {
  logger.info(message);
};

module.exports = logger;
module.exports.stream =
  { write: writeMessage
  };
