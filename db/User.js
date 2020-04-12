const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {}
  User.init(
    {
      languages: DataTypes.JSON,
    },
    { sequelize, modelName: 'user' }
  );
  return User;
};
