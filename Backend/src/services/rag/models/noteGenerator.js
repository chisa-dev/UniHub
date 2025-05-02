/**
 * Note Generator using RAG (Retrieval-Augmented Generation)
 * Generates educational notes based on retrieved context from materials
 */

const { Configuration, OpenAIApi } = require('openai');
const fs = require('fs');
const path = require('path');
const documentProcessor = require('../utils/documentProcessor');
const vectorStore = require('../utils/vectorStore');
const { format } = require('date-fns');
const { v4: uuidv4 } = require('uuid');

// Initialize OpenAI configuration if API key is available
let openai = null;
if (process.env.OPENAI_API_KEY) {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  openai = new OpenAIApi(configuration);
}

/**
 * Calculates estimated reading time for content
 * @param {string} content - Content to calculate reading time for
 * @returns {string} - Estimated reading time in minutes
 */
const calculateReadTime = (content) => {
  // Average reading speed: 200 words per minute
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} min read`;
};

/**
 * Indexes materials for a specific user and topic
 * @param {Array} materials - Array of material objects
 * @param {string} userId - User ID
 * @param {string} topicId - Topic ID
 * @param {number} maxMaterials - Maximum number of materials to process (default: 3)
 * @returns {Promise<Object>} - Indexing results
 */
const indexMaterials = async (materials, userId, topicId, maxMaterials = 3) => {
  try {
    // Create a unique collection name
    const collectionName = `user_${userId}_topic_${topicId}`;
    
    // Create collection in vector store - now async
    const createResult = await vectorStore.createCollection(collectionName);
    
    // Keep track of indexing results
    const results = {
      collectionName,
      success: true,
      collectionCreated: createResult.created,
      collectionExisted: createResult.existed,
      materialsProcessed: 0,
      materialsAdded: 0,
      errors: []
    };
    
    // Limit the number of materials to process
    if (materials.length > maxMaterials) {
      console.log(`[LOG note_generator] ========= Limiting materials from ${materials.length} to ${maxMaterials}`);
      materials = materials.slice(0, maxMaterials);
    }
    
    // Process each material
    for (const material of materials) {
      // Check if we have the uploaded_file property (from direct DB query)
      // or file_name and other properties (from Sequelize model)
      const uploadedFileName = material.uploaded_file || material.file_name;
      const fileName = material.file_name || uploadedFileName;
      const filePath = path.join(__dirname, '../../../../uploads/materials', uploadedFileName);
      
      results.materialsProcessed++;
      
      if (fs.existsSync(filePath)) {
        console.log(`[LOG note_generator] ========= Processing file: ${fileName}`);
        
        // Add metadata to each document
        const metadata = {
          materialId: material.id,
          fileName: fileName,
          fileType: material.file_type,
          topicId: topicId,
          userId: userId
        };
        
        try {
          // Process file and create embeddings - with a 90 second timeout
          const processPromise = documentProcessor.processFile(
            filePath, 
            material.file_type, 
            metadata
          );
          
          // Create a timeout promise
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Processing file timed out after 90 seconds')), 90000);
          });
          
          // Race the promises
          const documentsWithEmbeddings = await Promise.race([processPromise, timeoutPromise]);
          
          // Add documents to vector store - now async
          const addResult = await vectorStore.addDocuments(collectionName, documentsWithEmbeddings);
          
          if (addResult.success) {
            results.materialsAdded++;
          } else {
            results.errors.push({ materialId: material.id, error: addResult.error });
          }
        } catch (err) {
          console.error(`[LOG note_generator] ========= Error processing material ${material.id}:`, err);
          results.errors.push({ materialId: material.id, error: err.message });
        }
      } else {
        console.log(`[LOG note_generator] ========= File not found: ${filePath}`);
        results.errors.push({ materialId: material.id, error: 'File not found' });
      }
    }
    
    // Overall success based on at least some materials being added
    results.success = results.materialsAdded > 0;
    
    return results;
  } catch (error) {
    console.error('[LOG note_generator] ========= Error indexing materials:', error);
    return {
      collectionName: `user_${userId}_topic_${topicId}`,
      success: false,
      error: error.message
    };
  }
};

/**
 * Generates mock note content for development/testing
 * @param {string} title - Note title
 * @param {string} userGoal - User's goal
 * @param {Array} relevantDocs - Relevant documents
 * @returns {string} - Generated note content
 */
const generateMockNote = (title, userGoal, relevantDocs) => {
  console.log('[LOG note_generator] ========= Generating mock note (OpenAI API key not available)');
  
  // Extract some context from relevant documents if available
  let extractedContext = '';
  if (relevantDocs && relevantDocs.length > 0) {
    // Get up to 3 relevant documents
    const sampledDocs = relevantDocs.slice(0, Math.min(3, relevantDocs.length));
    extractedContext = sampledDocs.map(doc => {
      // Extract the first 100 characters from each document
      return doc.content.substring(0, 100) + '...';
    }).join('\n\n');
  }
  
  // Generate a simple structured note with markdown
  return `# ${title}

## Introduction

This is a mock note generated for: ${userGoal}

## Content from Materials

${extractedContext || 'No relevant materials were found.'}

## Key Points

- This is a mock note generated for testing purposes
- The RAG system can generate real notes when an OpenAI API key is configured
- Replace the placeholder in .env with a valid OpenAI API key

## Summary

This note is a placeholder. To generate real notes using the RAG system, add a valid OpenAI API key to your environment variables.`;
};

/**
 * Generates a note using RAG approach
 * @param {Object} params - Note generation parameters
 * @param {string} params.title - Note title
 * @param {string} params.userGoal - User's goal for the note
 * @param {Array} params.materials - Materials to use for context
 * @param {string} params.userId - User ID
 * @param {string} params.topicId - Topic ID
 * @returns {Promise<Object>} - Generated note data
 */
const generateNote = async ({ title, userGoal, materials = [], userId, topicId }) => {
  try {
    console.log(`[LOG note_generator] ========= Starting note generation for "${title}"`);
    
    // Create a unique collection name directly to avoid issues with indexMaterials
    const collectionName = `user_${userId}_topic_${topicId}`;
    console.log(`[LOG note_generator] ========= Using collection: ${collectionName}`);
    
    // Index materials if there are any
    if (materials.length > 0) {
      console.log(`[LOG note_generator] ========= Indexing ${materials.length} materials`);
      const indexResult = await indexMaterials(materials, userId, topicId);
      console.log(`[LOG note_generator] ========= Indexing completed with status: ${indexResult.success ? 'success' : 'failure'}`);
    } else {
      console.log(`[LOG note_generator] ========= No new materials to index`);
    }
    
    // Generate embedding for the query (title + goal)
    console.log(`[LOG note_generator] ========= Generating embedding for query`);
    const query = `Title: ${title}. Goal: ${userGoal}`;
    const queryEmbedding = await documentProcessor.generateEmbedding(query);
    console.log(`[LOG note_generator] ========= Embedding generated successfully`);
    
    // Search for relevant documents - now with timeout
    console.log(`[LOG note_generator] ========= Searching for relevant documents in ${collectionName}`);
    const relevantDocs = await vectorStore.search(collectionName, queryEmbedding, 10, 0.6, 15000); // 15 second timeout
    console.log(`[LOG note_generator] ========= Found ${relevantDocs.length} relevant document chunks`);
    
    // Generate note content based on relevant documents or as a mock
    let noteContent;
    
    // Check if OpenAI is available
    if (!openai) {
      console.log('[LOG note_generator] ========= OpenAI not available, generating mock note');
      noteContent = generateMockNote(title, userGoal, relevantDocs);
      console.log('[LOG note_generator] ========= Mock note generated successfully');
    } else {
      // Extract context from relevant documents
      let context = "No relevant materials found.";
      if (relevantDocs.length > 0) {
        context = relevantDocs.map(doc => {
          const { content, metadata } = doc;
          const source = metadata.fileName || 'Unknown source';
          return `--- From: ${source} ---\n${content}\n`;
        }).join('\n\n');
        console.log(`[LOG note_generator] ========= Extracted context from ${relevantDocs.length} documents`);
      }
      
      // Create system message
      const systemMessage = `You are an expert educational note-generator. Create a comprehensive, detailed and long note based on the provided context from learning materials. 
Format the response as markdown. Include appropriate headings, lists, tables, and code blocks as needed.
The note should be well-structured, informative, and tailored to the user's goal.
DO NOT include any greetings, explanations, or conversation - ONLY return the note content.`;
      
      // Create user message with context
      const userMessage = `For the title "${title}" and user goal "${userGoal}", create a comprehensive educational note using the following context from relevant materials:

${context}

Important reminders:
1. Structure the note with clear headers, subheaders, and sections
2. Include examples, diagrams (as markdown tables), and explanations
3. Focus specifically on achieving the user's stated goal
4. Return a complete, well-formatted markdown document
5. Do not mention that you're using provided context or materials`;
      
      console.log(`[LOG note_generator] ========= Calling OpenAI API for note generation`);
      
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
        
        console.log(`[LOG note_generator] ========= OpenAI API response received`);
        
        // Extract content from response
        noteContent = completion.data.choices[0].message.content;
      } catch (error) {
        console.error(`[LOG note_generator] ========= Error with OpenAI API:`, error);
        // Fallback to mock note if OpenAI times out or fails
        console.log(`[LOG note_generator] ========= Falling back to mock note`);
        noteContent = generateMockNote(title, userGoal, relevantDocs);
      }
    }
    
    // Calculate reading time
    console.log(`[LOG note_generator] ========= Calculating reading time`);
    const readTime = calculateReadTime(noteContent);
    
    // Create note data object
    const note = {
      id: uuidv4(),
      title,
      userGoal,
      content: noteContent,
      readTime,
      date: format(new Date(), 'MMM d, yyyy'),
      topicId,
      userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log(`[LOG note_generator] ========= Note generation completed successfully`);
    return note;
  } catch (error) {
    console.error('[LOG note_generator] ========= Error generating note:', error);
    throw new Error(`Failed to generate note: ${error.message}`);
  }
};

/**
 * Handles a chat conversation with context from materials in a topic
 * @param {Object} params - Chat parameters
 * @param {string} params.message - User message
 * @param {string} params.userId - User ID
 * @param {string|null} params.topicId - Topic ID (optional)
 * @param {Array} params.previousMessages - Previous messages in the conversation
 * @returns {Promise<string>} - Assistant response
 */
const chatWithTopic = async ({ message, userId, topicId, previousMessages = [] }) => {
  try {
    console.log(`[LOG chat_with_topic] ========= Starting chat ${topicId ? `for topic ${topicId}` : '(general academic chat)'}`);
    const startTime = Date.now();
    
    let relevantDocs = [];
    let context = "No relevant materials found.";
    
    // Only search for relevant documents if topicId is provided
    if (topicId) {
      // Create a unique collection name (same format as indexMaterials)
      const collectionName = `user_${userId}_topic_${topicId}`;
      console.log(`[LOG chat_with_topic] ========= Using collection: ${collectionName}`);
      
      // Generate embedding for the query
      console.log(`[LOG chat_with_topic] ========= Generating embedding for user query`);
      const queryEmbedding = await documentProcessor.generateEmbedding(message);
      console.log(`[LOG chat_with_topic] ========= Embedding generated successfully`);
      
      // Search for relevant documents - use a faster timeout for chat (10 seconds)
      console.log(`[LOG chat_with_topic] ========= Searching for relevant context in ${collectionName}`);
      relevantDocs = await vectorStore.search(collectionName, queryEmbedding, 5, 0.6, 10000);
      console.log(`[LOG chat_with_topic] ========= Found ${relevantDocs.length} relevant document chunks in ${(Date.now() - startTime)/1000}s`);
      
      // Extract context from relevant documents
      if (relevantDocs.length > 0) {
        context = relevantDocs.map(doc => {
          const source = doc.metadata.fileName || 'Unknown source';
          return `--- From: ${source} ---\n${doc.content}`;
        }).join('\n\n');
        console.log(`[LOG chat_with_topic] ========= Extracted context from ${relevantDocs.length} documents`);
      }
    } else {
      console.log(`[LOG chat_with_topic] ========= No topicId provided, using general academic chat`);
    }
    
    // Check if OpenAI is available
    if (!openai) {
      console.log('[LOG chat_with_topic] ========= OpenAI not available, generating mock response');
      return `**Mock Chat Response**

I don't have access to OpenAI API at the moment${topicId ? `, but I found ${relevantDocs.length} relevant documents in your materials` : ''}.

Your query was: "${message}"

To use the chat feature properly, please make sure the OpenAI API key is configured.`;
    }
    
    // Format previous messages in the right format for OpenAI API
    const formattedPreviousMessages = previousMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Create system message - different for topic-based vs general chat
    const systemMessage = topicId 
      ? `You are an expert academic tutor specializing in educational topics.
Respond to the user's queries based on the context provided from their learning materials.
Format your responses using markdown. Include appropriate headings, lists, tables, code blocks, and mathematical notation as needed.
Your tone should be academic, detailed, and precise. Provide in-depth explanations that demonstrate expertise.
If formulas or equations are relevant, use LaTeX notation within markdown (e.g., $E = mc^2$).
If coding examples are needed, provide them in appropriate markdown code blocks with the language specified.
Always aim to be factually accurate and cite or reference the specific materials when possible.
Do not fabricate information if it's not in the provided context - acknowledge gaps in knowledge.`
      : `You are an expert academic tutor specializing in educational topics.
Respond to the user's queries with comprehensive and academically rigorous answers.
Format your responses using markdown. Include appropriate headings, lists, tables, code blocks, and mathematical notation as needed.
Your tone should be academic, detailed, and precise. Provide in-depth explanations that demonstrate expertise.
If formulas or equations are relevant, use LaTeX notation within markdown (e.g., $E = mc^2$).
If coding examples are needed, provide them in appropriate markdown code blocks with the language specified.
Always aim to be factually accurate and acknowledge limitations in your knowledge when appropriate.
Provide reliable information from an educational perspective.`;
    
    // Create message array with system message, context, previous messages and current query
    const messages = [
      { role: 'system', content: systemMessage }
    ];
    
    if (topicId) {
      // Only add the context message if we have previous messages (otherwise include it with the first user message)
      if (formattedPreviousMessages.length > 0) {
        // Add a system message with context
        messages.push({ 
          role: 'system', 
          content: `Here is context from the user's learning materials that may be relevant to their query:\n\n${context}`
        });
        
        // Add previous conversation messages
        messages.push(...formattedPreviousMessages);
        
        // Add the current user message
        messages.push({ role: 'user', content: message });
      } else {
        // For the first message, combine the context and query
        messages.push({ 
          role: 'user', 
          content: `Here is context from my learning materials:\n\n${context}\n\nBased on this context, please answer my question: ${message}`
        });
      }
    } else {
      // For general chat, just include previous messages and current query
      if (formattedPreviousMessages.length > 0) {
        messages.push(...formattedPreviousMessages);
      }
      
      messages.push({ role: 'user', content: message });
    }
    
    console.log(`[LOG chat_with_topic] ========= Calling OpenAI API with ${messages.length} messages`);
    
    try {
      // Generate completion from OpenAI with a faster timeout for chat (15 seconds)
      const completion = await Promise.race([
        openai.createChatCompletion({
          model: 'gpt-3.5-turbo',
          messages: messages,
          temperature: 0.3, // Lower temperature for more factual responses
          max_tokens: 2000  // Shorter responses than full notes
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('OpenAI request timed out after 15 seconds')), 15000)
        )
      ]);
      
      console.log(`[LOG chat_with_topic] ========= OpenAI API response received in ${(Date.now() - startTime)/1000}s`);
      
      // Extract content from response
      const responseContent = completion.data.choices[0].message.content;
      return responseContent;
    } catch (error) {
      console.error(`[LOG chat_with_topic] ========= Error with OpenAI API:`, error);
      // Return a helpful message if the API fails
      return `I encountered an error while processing your request. Please try again in a moment.

Error details: ${error.message}`;
    }
  } catch (error) {
    console.error('[LOG chat_with_topic] ========= Error in chat function:', error);
    throw new Error(`Failed to generate chat response: ${error.message}`);
  }
};

module.exports = {
  generateNote,
  calculateReadTime,
  indexMaterials,
  generateMockNote,
  chatWithTopic
}; 