const { Configuration, OpenAIApi } = require('openai');
const db = require('../models');
const { Topic, Quiz } = db;

// Initialize OpenAI configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Helper function to generate OpenAI chat completion
async function generateChatCompletion(messages, options = {}) {
  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 500,
      ...options
    });
    return completion.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to generate AI response');
  }
}

// Chat with AI assistant
exports.chat = async (req, res) => {
  try {
    const { message, context } = req.body;
    const userId = req.user.id;

    let messages = [
      { role: 'system', content: 'You are a helpful educational AI assistant.' }
    ];

    // Add context if provided
    if (context) {
      if (context.topicId) {
        const topic = await Topic.findByPk(context.topicId);
        if (topic) {
          messages.push({
            role: 'system',
            content: `The current topic of discussion is: ${topic.name}. ${topic.description}`
          });
        }
      }
      if (context.previousMessages) {
        messages = [...messages, ...context.previousMessages];
      }
    }

    // Add user's current message
    messages.push({ role: 'user', content: message });

    const response = await generateChatCompletion(messages);

    res.json({
      success: true,
      response,
      messages: [...messages, { role: 'assistant', content: response }]
    });
  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get AI explanation for a topic
exports.explain = async (req, res) => {
  try {
    const { topic, level = 'intermediate', format = 'text' } = req.body;

    const prompt = `Explain the following topic: "${topic}"
Level: ${level}
Format: ${format}

Please provide a clear and comprehensive explanation suitable for a ${level} level student.
${format === 'bullet_points' ? 'Use bullet points for key concepts.' : ''}
${format === 'step_by_step' ? 'Break down the explanation into clear, sequential steps.' : ''}`;

    const messages = [
      { role: 'system', content: 'You are an expert educational tutor.' },
      { role: 'user', content: prompt }
    ];

    const explanation = await generateChatCompletion(messages, {
      temperature: 0.7,
      maxTokens: 1000
    });

    res.json({
      success: true,
      explanation,
      metadata: { topic, level, format }
    });
  } catch (error) {
    console.error('Explain Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Generate quiz questions
exports.generateQuiz = async (req, res) => {
  try {
    const {
      topicId,
      questionCount = 5,
      difficulty = 'medium',
      types = ['multiple_choice']
    } = req.body;

    const topic = await Topic.findByPk(topicId);
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    const prompt = `Generate ${questionCount} ${difficulty} difficulty questions about ${topic.name}.
Include a mix of the following question types: ${types.join(', ')}.
For each question, provide:
1. The question text
2. The correct answer
3. For multiple choice questions, provide 4 options including the correct answer
4. A brief explanation of the correct answer

Format the response as a JSON array of question objects.`;

    const messages = [
      { role: 'system', content: 'You are an expert quiz generator.' },
      { role: 'user', content: prompt }
    ];

    const response = await generateChatCompletion(messages, {
      temperature: 0.8,
      maxTokens: 2000
    });

    // Parse the response and store in database
    const questions = JSON.parse(response);
    const quiz = await Quiz.create({
      topicId,
      title: `${topic.name} - ${difficulty} Quiz`,
      description: `Auto-generated ${difficulty} difficulty quiz for ${topic.name}`,
      questions: questions,
      createdBy: req.user.id
    });

    res.json({
      success: true,
      quiz,
      questions
    });
  } catch (error) {
    console.error('Quiz Generation Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Generate content summary
exports.summarize = async (req, res) => {
  try {
    const {
      content,
      maxLength = 500,
      format = 'paragraph'
    } = req.body;

    const prompt = `Summarize the following content in ${format} format, keeping it under ${maxLength} characters:

${content}

${format === 'bullet_points' ? 'Use bullet points for key points.' : ''}
${format === 'key_points' ? 'Extract and highlight the most important key points.' : ''}`;

    const messages = [
      { role: 'system', content: 'You are an expert at creating concise summaries.' },
      { role: 'user', content: prompt }
    ];

    const summary = await generateChatCompletion(messages, {
      temperature: 0.5,
      maxTokens: Math.min(Math.ceil(maxLength / 4), 1000)
    });

    res.json({
      success: true,
      summary,
      metadata: {
        originalLength: content.length,
        summaryLength: summary.length,
        format
      }
    });
  } catch (error) {
    console.error('Summarize Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}; 