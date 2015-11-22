'use strict';
var co = require('co')

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('Person', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
    return queryInterface
      .bulkInsert
      ( 'routeRoles'
      , [ { roleId: 2
          , routeId: 1
          }
        , { roleId: 2
          , routeId: 2
          }
        , { roleId: 2
          , routeId: 3
          }
        , { roleId: 2
          , routeId: 4
          }
        , { roleId: 2
          , routeId: 5
          }
        , { roleId: 2
          , routeId: 6
          }
        , { roleId: 2
          , routeId: 7
          }
        , { roleId: 2
          , routeId: 8
          }
        , { roleId: 2
          , routeId: 9
          }
        , { roleId: 2
          , routeId: 10
          }
        , { roleId: 2
          , routeId: 11
          }
        , { roleId: 2
          , routeId: 12
          }
        , { roleId: 2
          , routeId: 13
          }
        , { roleId: 2
          , routeId: 14
          }
        , { roleId: 2
          , routeId: 15
          }
        ]
      )
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('Person', null, {});
    */
    return queryInterface.bulkDelete('routeRoles', null, {})
  }
};
