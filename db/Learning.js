const { Model } = require('sequelize');


module.exports = (sequelize, DataTypes) => {
  class Learning extends Model {
    constructor() {
      this.intervals = [1, 2, 4, 7, 16, 20, 40, 60]
    }
  }
  Learning.init(
    {
      word_id: DataTypes.NUMBER,
      stage: DataTypes.NUMBER,
      last_reviewed: DataTypes.DATEONLY,
      should_review: DataTypes.BOOLEAN,
    },
    { sequelize, modelName: 'learning', tableName: 'learning' }
  );
  return Learning
};
