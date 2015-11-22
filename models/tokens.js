'use strict';
module.exports = function(sequelize, DataTypes) {
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
  }

  var Token = sequelize
  .define
  ( 'Token'
  , schema
  , { tableName: 'token'
    , singular: 'token'
    , plural: 'tokens'
    }
  )

  return Token
}
