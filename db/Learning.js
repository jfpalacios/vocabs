const { Model } = require('sequelize');
const date = require('date-and-time');

module.exports = (sequelize, DataTypes) => {
  class Learning extends Model {
    static Freq = {
      SOON: 'SOON',
      LATER: 'LATER',
      NEVER: 'NEVER'
    };
    constructor(...args) {
      super(...args);
      this.intervals = [1, 1, 2, 3, 4, 5, 7, 9, 12, 15, 20, 25];
    }
    markFrequency(action) {
      if (action == Learning.Freq.SOON) {
        this.stage += 1;
      } else if (action == Learning.Freq.LATER) {
        this.stage += 2;
      } else if (action == Learning.Freq.NEVER) {
        this.active = false;
        this.save();
        return;
      }
      this.due_date = this.active ? date.addDays(new Date(), this.intervals[this.stage]) : null;
      this.save()
    }
    isNewWord() {
      return this.stage == -1;
    }
  }
  Learning.init(
    {
      word_id: DataTypes.NUMBER,
      stage: DataTypes.NUMBER,
      active: DataTypes.BOOLEAN,
      due_date: DataTypes.DATEONLY
    },
    { sequelize, modelName: 'learning', tableName: 'learning' }
  );
  return Learning;
};
