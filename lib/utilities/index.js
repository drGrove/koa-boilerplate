'use strict';

module.exports = function(app) {
  var path = require('path');
  var genToken = require(path.join(__dirname, '/genToken'))(app);
  var genRefresh = require(path.join(__dirname, '/genRefresh'))(app);

  var utilities = {};

  utilities.genToken = genToken;
  utilities.genRefresh = genRefresh;

  return utilities;
};
