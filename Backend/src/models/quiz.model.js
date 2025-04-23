const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Quiz = sequelize.define('Quiz', {
    id: {
      type: DataTypes.STRING(36),
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    questions: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isValidQuestions(value) {
          if (!Array.isArray(value)) {
            throw new Error('Questions must be an array');
          }
          if (value.length === 0) {
            throw new Error('Quiz must have at least one question');
          }
          value.forEach(question => {
            if (!question.text || !question.correctAnswer) {
              throw new Error('Each question must have text and correctAnswer');
            }
          });
        }
      }
    },
    difficulty: {
      type: DataTypes.ENUM('easy', 'medium', 'hard'),
      defaultValue: 'medium'
    },
    timeLimit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0
      }
    },
    topicId: {
      type: DataTypes.STRING(36),
      allowNull: false,
      references: {
        model: 'Topics',
        key: 'id'
      }
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

  Quiz.associate = (models) => {
    Quiz.belongsTo(models.Topic, {
      foreignKey: 'topicId',
      as: 'topic'
    });
    Quiz.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
    Quiz.hasMany(models.QuizAttempt, {
      foreignKey: 'quizId',
      as: 'attempts'
    });
  };

  return Quiz;
}; 