const sequelize = require('../config/database');
const User = require('./user.model');

const models = {
  User
};

// Initialize models
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = {
  sequelize,
  ...models
}; 