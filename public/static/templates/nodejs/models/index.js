forEach: BoundedContext
fileName: index.js
path: {{name}}/models
---
const Sequelize = require('sequelize');

const db = {};

const sequelize = new Sequelize('sqlite::memory:');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

db.sequelize = sequelize;
db.Sequelize = Sequelize;

{{#aggregates}}
db.{{namePascalCase}} = require('./{{namePascalCase}}')(sequelize, Sequelize);
db.{{namePascalCase}}.init(sequelize, Sequelize);
{{/aggregates}}

module.exports = db;