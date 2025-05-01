const sequelize = require('../config/database');
const User = require('./user.model');
const TopicModel = require('./topic.model');
const QuizModel = require('./quiz.model');
const QuizAttemptModel = require('./quiz-attempt.model');
const StudySessionModel = require('./study-session.model');
const TopicProgressModel = require('./topic-progress.model');
const NoteProgressModel = require('./note-progress.model');
const QuizProgressModel = require('./quiz-progress.model');
const MaterialModel = require('./material.model');

// Initialize models with sequelize instance
const Topic = TopicModel(sequelize);
const Quiz = QuizModel(sequelize);
const QuizAttempt = QuizAttemptModel(sequelize);
const StudySession = StudySessionModel(sequelize);
const TopicProgress = TopicProgressModel(sequelize);
const NoteProgress = NoteProgressModel(sequelize);
const QuizProgress = QuizProgressModel(sequelize);
const Material = MaterialModel(sequelize);

const models = {
  User,
  Topic,
  Quiz,
  QuizAttempt,
  StudySession,
  TopicProgress,
  NoteProgress,
  QuizProgress,
  Material
};

// Initialize associations
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = {
  sequelize,
  ...models
}; 