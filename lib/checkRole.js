'use strict';

module.exports = function *checkRole() {
  var route = this.originalUrl;
  var userRoles = this.auth.Roles;
  var method = this.request.method.toLowerCase();
  var roleCount = userRoles.length;

  // Concat all routes arrays
  var whitelist = [];

  // Check for admin role
  for (let i = 0; i < roleCount; i++) {
    // If admin - full access
    if (userRoles[i].name === 'admin') {
      this.auth.isAdmin = true;
      return true;
    }
  }

  for (let i = 0; i < userRoles.length; i++) {
    whitelist = whitelist.concat(userRoles[i].Routes);
  }

  var routeCount = whitelist.length;
  for (let i = 0; i < routeCount; i++) {
    var routeItem = whitelist[i];
    var regexp = new RegExp(routeItem.url);
    var routeMethod = routeItem.method.toLowerCase();
    if
    ( routeMethod === method &&
      route.match(regexp)
    ) {
      return true;
    }
  }

  return false;
};
