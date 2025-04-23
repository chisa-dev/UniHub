const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const QuizAttempt = sequelize.define('QuizAttempt', {
    id: {
      type: DataTypes.STRING(36),
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    quizId: {
      type: DataTypes.STRING(36),
      allowNull: false,
      references: {
        model: 'Quizzes',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.STRING(36),
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    answers: {
      type: DataTypes.JSON,
      allowNull: false
    },
    score: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        max: 100
      }
    },
    timeSpent: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0
      }
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps: true
  });

  QuizAttempt.associate = (models) => {
    QuizAttempt.belongsTo(models.Quiz, {
      foreignKey: 'quizId',
      as: 'quiz'
    });
    QuizAttempt.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return QuizAttempt;
}; 