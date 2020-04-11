var fs = require('fs');
var path = require('path');
const { Sequelize, Model, DataTypes } = require('sequelize');
var basename = path.basename(__filename);
var env = process.env.NODE_ENV || 'development';
var db = {};

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: `${__dirname}/../data/vocabs.db`
});

fs.readdirSync(__dirname)
  .filter(file => {
    return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js';
  })
  .forEach(file => {
    var model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
