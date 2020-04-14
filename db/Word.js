const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Word extends Model {}
  Word.init(
    {
      lang: DataTypes.STRING,
      word: { type: DataTypes.STRING, unique: true, index: true },
      results: DataTypes.JSON,
      level: DataTypes.STRING,
    },
    { sequelize, modelName: 'word' }
  );
  return Word
};
