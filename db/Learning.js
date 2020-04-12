const { Model } = require('sequelize');


module.exports = (sequelize, DataTypes) => {
  class Learning extends Model {
    // constructor() {
    //   super();
    //   this.intervals = [1, 2, 4, 7, 16, 20, 40, 60]
    // }
  }
  Learning.init(
    {
      word_id: DataTypes.NUMBER,
      stage: DataTypes.NUMBER,
      should_review: DataTypes.BOOLEAN,
      due_date: DataTypes.DATEONLY,
    },
    { sequelize, modelName: 'learning', tableName: 'learning' }
  );
  return Learning
};
