'use strict';
module.exports = function(sequelize, DataTypes) {
  const NODE_ENV = process.env.NODE_ENV;
  var schema =
  { id:
    { type: DataTypes.BIGINT
    , autoIncrement: true
    , primaryKey: true
    }
  , token:
    { type: DataTypes.STRING
    , allowNull: false
    , unique: true
    }
  , userId:
    { type: DataTypes.BIGINT
    , allowNull: false
    }
  , refresh:
    { type: DataTypes.STRING
    , allowNull: false
    }
  };

  var Token = sequelize
  .define
    ( 'Token'
    , schema
    , { tableName: 'token'
      , singular: 'token'
      , plural: 'tokens'
      , paranoid: String(NODE_ENV).toUpperCase() !== "TESTING"
      }
    );

  return Token;
};
