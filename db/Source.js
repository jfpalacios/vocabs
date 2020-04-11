const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Source extends Model {}
  Source.init(
    {
      lang: DataTypes.STRING,
      url: DataTypes.STRING,
      processed: DataTypes.BOOLEAN
    },
    { sequelize, modelName: 'source' }
  );
  return Source
};