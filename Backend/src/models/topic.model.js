const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Topic = sequelize.define('Topic', {
    id: {
      type: DataTypes.STRING(36),
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    difficulty: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
      defaultValue: 'intermediate'
    },
    createdBy: {
      type: DataTypes.STRING(36),
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    timestamps: true
  });

  Topic.associate = (models) => {
    Topic.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
    Topic.hasMany(models.Quiz, {
      foreignKey: 'topicId',
      as: 'quizzes'
    });
  };

  return Topic;
}; 