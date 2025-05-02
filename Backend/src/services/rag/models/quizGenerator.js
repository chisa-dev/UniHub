/**
 * Quiz Generator using RAG (Retrieval-Augmented Generation)
 * Generates educational quizzes based on retrieved context from materials
 */

const { Configuration, OpenAIApi } = require('openai');
const { v4: uuidv4 } = require('uuid');
const documentProcessor = require('../utils/documentProcessor');
const vectorStore = require('../utils/vectorStore');

// Initialize OpenAI configuration if API key is available
let openai = null;
if (process.env.OPENAI_API_KEY) {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  openai = new OpenAIApi(configuration);
}

/**
 * Generate a quiz for a topic using RAG
 * @param {Object} params - Quiz generation parameters
 * @param {string} params.title - Quiz title
 * @param {string} params.difficulty - Quiz difficulty (easy, medium, hard)
 * @param {number} params.numQuestions - Number of questions to generate
 * @param {string} params.userId - User ID
 * @param {string} params.topicId - Topic ID
 * @returns {Promise<Object>} - Generated quiz data
 */
const generateQuiz = async ({ title, difficulty, numQuestions, userId, topicId }) => {
  try {
    console.log(`[LOG quiz_generator] ========= Starting quiz generation for "${title}"`);
    
    // Create a unique collection name
    const collectionName = `user_${userId}_topic_${topicId}`;
    console.log(`[LOG quiz_generator] ========= Using collection: ${collectionName}`);
    
    // Generate embedding for the query
    console.log(`[LOG quiz_generator] ========= Generating embedding for quiz topic`);
    const query = `Create a ${difficulty} quiz about ${title}`;
    const queryEmbedding = await documentProcessor.generateEmbedding(query);
    console.log(`[LOG quiz_generator] ========= Embedding generated successfully`);
    
    // Search for relevant documents
    console.log(`[LOG quiz_generator] ========= Searching for relevant documents in ${collectionName}`);
    const relevantDocs = await vectorStore.search(collectionName, queryEmbedding, 10, 0.6, 15000);
    console.log(`[LOG quiz_generator] ========= Found ${relevantDocs.length} relevant document chunks`);
    
    // Generate quiz content based on relevant documents
    let quizContent;
    
    // Check if OpenAI is available
    if (!openai) {
      console.log('[LOG quiz_generator] ========= OpenAI not available, generating mock quiz');
      quizContent = generateMockQuiz(title, difficulty, numQuestions);
      console.log('[LOG quiz_generator] ========= Mock quiz generated successfully');
    } else {
      // Extract context from relevant documents
      let context = "No relevant materials found.";
      if (relevantDocs.length > 0) {
        context = relevantDocs.map(doc => {
          const { content, metadata } = doc;
          const source = metadata.fileName || 'Unknown source';
          return `--- From: ${source} ---\n${content}\n`;
        }).join('\n\n');
        console.log(`[LOG quiz_generator] ========= Extracted context from ${relevantDocs.length} documents`);
      }
      
      // Create system message
      const systemMessage = `You are an expert quiz generator for educational purposes. Create a comprehensive quiz based on the provided context from learning materials.
Create a JSON array of quiz questions. Each question should have the following structure:
{
  "question": "Question text here",
  "questionType": "multiple_choice",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "Option B"
}

Rules:
1. All questions MUST be multiple choice with 4 options
2. Make sure the quiz is appropriately ${difficulty} difficulty level
3. Ensure questions test conceptual understanding and not just recall
4. Questions should be clear and unambiguous
5. IMPORTANT: You must ONLY return valid JSON, nothing else before or after`;
      
      // Create user message with context
      const userMessage = `For the quiz "${title}" with ${difficulty} difficulty, create a quiz with ${numQuestions} multiple-choice questions using the following context from relevant materials:

${context}

Generate a JSON array of quiz questions as specified. Make sure it's valid JSON format that can be parsed directly.
IMPORTANT: ONLY return the JSON array, nothing else.`;
      
      console.log(`[LOG quiz_generator] ========= Calling OpenAI API for quiz generation`);
      
      try {
        // Generate completion from OpenAI with timeout
        const completion = await Promise.race([
          openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: systemMessage },
              { role: 'user', content: userMessage }
            ],
            temperature: 0.7,
            max_tokens: 4000
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('OpenAI request timed out after 25 seconds')), 25000)
          )
        ]);
        
        console.log(`[LOG quiz_generator] ========= OpenAI API response received`);
        
        // Extract content from response
        const aiResponse = completion.data.choices[0].message.content;
        
        // Parse JSON response
        try {
          // Sometimes the API returns the JSON with markdown code blocks, so we need to extract it
          const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || 
                           aiResponse.match(/```\n([\s\S]*?)\n```/) || 
                           [null, aiResponse];
          
          const jsonString = jsonMatch[1] || aiResponse;
          quizContent = JSON.parse(jsonString);
          
          // Validate the quiz content structure
          if (!Array.isArray(quizContent)) {
            throw new Error("Response is not a valid array");
          }
          
          // Ensure each question has the required properties
          quizContent = quizContent.map((question, index) => {
            if (!question.question || !question.options || !question.correctAnswer) {
              throw new Error(`Question ${index + 1} is missing required properties`);
            }
            return {
              ...question,
              questionType: question.questionType || "multiple_choice", // Default to multiple choice
              id: uuidv4() // Add unique ID to each question
            };
          });
          
        } catch (jsonError) {
          console.error(`[LOG quiz_generator] ========= Error parsing quiz JSON:`, jsonError);
          console.error(`[LOG quiz_generator] ========= Raw response:`, aiResponse);
          // Fallback to mock quiz if parsing fails
          quizContent = generateMockQuiz(title, difficulty, numQuestions);
        }
      } catch (error) {
        console.error(`[LOG quiz_generator] ========= Error with OpenAI API:`, error);
        // Fallback to mock quiz if OpenAI times out or fails
        console.log(`[LOG quiz_generator] ========= Falling back to mock quiz`);
        quizContent = generateMockQuiz(title, difficulty, numQuestions);
      }
    }
    
    // Create quiz data object
    const quizId = uuidv4();
    const quiz = {
      id: quizId,
      title,
      description: `AI-generated ${difficulty} quiz about ${title}`,
      difficulty,
      topic_id: topicId,
      user_id: userId,
      is_public: false,
      is_ai_generated: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log(`[LOG quiz_generator] ========= Quiz generation completed successfully`);
    return { quiz, questions: quizContent };
  } catch (error) {
    console.error('[LOG quiz_generator] ========= Error generating quiz:', error);
    throw new Error(`Failed to generate quiz: ${error.message}`);
  }
};

/**
 * Generates mock quiz content for development/testing
 * @param {string} title - Quiz title
 * @param {string} difficulty - Quiz difficulty
 * @param {number} numQuestions - Number of questions to generate
 * @returns {Array} - Generated quiz questions
 */
const generateMockQuiz = (title, difficulty, numQuestions) => {
  console.log('[LOG quiz_generator] ========= Generating mock quiz (OpenAI API key not available)');
  
  const mockQuestions = [];
  
  for (let i = 0; i < numQuestions; i++) {
    mockQuestions.push({
      id: uuidv4(),
      question: `Sample ${difficulty} question ${i+1} about ${title}?`,
      questionType: "multiple_choice",
      options: [
        "Sample answer A",
        "Sample answer B",
        "Sample answer C",
        "Sample answer D"
      ],
      correctAnswer: "Sample answer B"
    });
  }
  
  return mockQuestions;
};

module.exports = {
  generateQuiz
}; 