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
    topic_id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      references: {
        model: 'topics',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'quizzes',
    timestamps: true,
    underscored: true
  });

  Quiz.associate = (models) => {
    Quiz.belongsTo(models.Topic, {
      foreignKey: 'topic_id',
      as: 'topic'
    });
    Quiz.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'creator'
    });
    Quiz.hasMany(models.QuizAttempt, {
      foreignKey: 'quiz_id',
      as: 'attempts'
    });
  };

  return Quiz;
}; 