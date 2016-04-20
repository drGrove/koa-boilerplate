'use strict';
var expect = require('expect');
var db = require(process.env.PROJECT_ROOT + '/lib/db.js');

describe('DB Connection:', function() {
  it('Should show this', function() {
    expect(false).toBe(false);
  });

  it('Should be an object', function() {
    expect(typeof db).toBe('object');
  });

  it('Should be able to show tables', function *() {
    var sequelize = db.sequelize;
    let stmt = 'SHOW TABLES';
    let tables = yield sequelize
      .query
      ( stmt
      , { type: sequelize.QueryTypes.SHOWTABLES
        }
      );
    expect(Array.isArray(tables)).toBe(true);
  });
});
