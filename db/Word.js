const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Word extends Model {
  
  }
  Word.init(
    {
      lang: DataTypes.STRING,
      word: { type: DataTypes.STRING, unique: true, index: true },
      definition: DataTypes.STRING,
      level: DataTypes.STRING,
    },
    { sequelize, modelName: 'word' }
  );
  return Word
};
