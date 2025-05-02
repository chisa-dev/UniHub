/**
 * RAG Controller
 * Handles RAG (Retrieval-Augmented Generation) related operations
 */

const ragService = require('../services/rag');
const { check, validationResult } = require('express-validator');
const db = require('../models');
const { sequelize } = db;
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

/**
 * Verify if the OpenAI API key is valid
 * @returns {Promise<boolean>} - Whether the key is valid
 */
const verifyOpenAIKey = async () => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.log('[LOG rag_controller] ========= No OpenAI API key found in environment variables');
      return false;
    }
    
    console.log('[LOG rag_controller] ========= Verifying OpenAI API key...');
    
    // Try a simple completion to verify the key
    const { Configuration, OpenAIApi } = require('openai');
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    
    // We'll set a short timeout to avoid hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('OpenAI API verification timed out')), 5000);
    });
    
    // Create a simple test request
    const testPromise = openai.createEmbedding({
      model: 'text-embedding-ada-002',
      input: 'Test'
    });
    
    // Race the promises
    await Promise.race([testPromise, timeoutPromise]);
    
    console.log('[LOG rag_controller] ========= OpenAI API key is valid');
    return true;
  } catch (error) {
    console.error('[LOG rag_controller] ========= OpenAI API key verification failed:', error.message);
    return false;
  }
};

/**
 * Generate a note using RAG
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Generated note
 */
const generateNote = async (req, res) => {
  // Set a longer timeout for this request (5 minutes)
  req.setTimeout(300000);
  
  // Create a flag to track if the response has been sent
  let responseSent = false;
  
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      responseSent = true;
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if OpenAI API key is valid
    const isOpenAIKeyValid = await verifyOpenAIKey();
    if (!isOpenAIKeyValid) {
      console.log('[LOG rag_controller] ========= Using mock note generation due to OpenAI API key issues');
      responseSent = true;
      return res.redirect(307, '/api/rag/notes/mock');
    }

    const { title, userGoal, topicId, isPrivate = false } = req.body;
    const userId = req.user.id;

    // Add logic to handle the case if the request takes too long
    const timeout = setTimeout(() => {
      if (!responseSent) {
        responseSent = true;
        console.log(`[LOG rag_controller] ========= Request timeout for note generation: "${title}"`);
        res.status(202).json({
          message: 'Note generation is taking longer than expected and will continue in the background',
          note: {
            title,
            topicId,
            status: 'processing'
          }
        });
      }
    }, 30000); // 30 seconds timeout

    // Verify topic belongs to user
    const topic = await db.Topic.findOne({ where: { id: topicId, user_id: userId } });
    if (!topic) {
      clearTimeout(timeout);
      responseSent = true;
      return res.status(404).json({ error: 'Topic not found' });
    }

    // Get materials for this topic
    const materials = await db.Material.findAll({ where: { topic_id: topicId, user_id: userId } });

    // Generate note
    console.log(`[LOG rag_controller] ========= Generating note: "${title}" for user ${userId}`);
    const generatedNote = await ragService.generateNote({
      title,
      userGoal,
      materials,
      userId,
      topicId
    });

    // Since we don't have a Note model, we'll create the note using sequelize directly
    const noteId = uuidv4();
    await sequelize.query(
      `INSERT INTO notes (id, title, content, topic_id, user_id, is_private, user_goal, read_time) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      {
        replacements: [
          noteId, 
          title, 
          generatedNote.content, 
          topicId, 
          userId, 
          isPrivate ? 1 : 0, 
          userGoal,
          generatedNote.readTime
        ]
      }
    );

    // Clear the timeout as we've successfully completed
    clearTimeout(timeout);
    
    // Only send response if we haven't sent one due to timeout
    if (!responseSent) {
      responseSent = true;
      res.status(201).json({
        message: 'Note generated successfully',
        note: {
          id: noteId,
          title: title,
          content: generatedNote.content,
          readTime: generatedNote.readTime,
          topicId: topicId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPrivate: isPrivate
        }
      });
    }
  } catch (error) {
    console.error('[LOG rag_controller] ========= Error generating note:', error);
    
    // Only send response if we haven't sent one due to timeout
    if (!responseSent) {
      responseSent = true;
      
      if (error.message && error.message.includes('timed out')) {
        res.status(504).json({ error: 'Note generation timed out. Please try again later or with fewer materials.' });
      } else {
        res.status(500).json({ error: `Failed to generate note: ${error.message}` });
      }
    }
  }
};

/**
 * Search materials for a topic
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Search results
 */
const searchMaterials = async (req, res) => {
  try {
    const { query, topicId } = req.query;
    const userId = req.user.id;
    
    if (!query || !topicId) {
      return res.status(400).json({ error: 'Query and topicId are required' });
    }

    // Verify topic belongs to user
    const topic = await db.Topic.findOne({ where: { id: topicId, user_id: userId } });
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    // Search materials
    console.log(`[LOG rag_controller] ========= Searching materials for "${query}" in topic ${topicId}`);
    const results = await ragService.searchMaterials(query, userId, topicId, 10);

    res.json({
      message: 'Search completed',
      results: results.map(result => ({
        content: result.content,
        fileName: result.metadata.fileName,
        materialId: result.metadata.materialId,
        score: result.score
      }))
    });
  } catch (error) {
    console.error('[LOG rag_controller] ========= Error searching materials:', error);
    res.status(500).json({ error: `Failed to search materials: ${error.message}` });
  }
};

/**
 * Index materials for a topic
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Status
 */
const indexMaterials = async (req, res) => {
  try {
    const { topicId } = req.params;
    const userId = req.user.id;

    // Verify topic belongs to user
    const topic = await db.Topic.findOne({ where: { id: topicId, user_id: userId } });
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    // Get materials for this topic
    const materials = await db.Material.findAll({ where: { topic_id: topicId, user_id: userId } });
    
    if (materials.length === 0) {
      return res.status(400).json({ error: 'No materials found for this topic' });
    }

    // Index materials
    console.log(`[LOG rag_controller] ========= Indexing ${materials.length} materials for topic ${topicId}`);
    const indexResult = await ragService.indexMaterials(materials, userId, topicId);

    if (indexResult.success) {
      res.json({
        message: indexResult.collectionExisted 
          ? 'Materials added to existing index' 
          : 'Materials indexed successfully',
        collectionName: indexResult.collectionName,
        materialsProcessed: indexResult.materialsProcessed,
        materialsAdded: indexResult.materialsAdded,
        errors: indexResult.errors.length > 0 ? indexResult.errors : undefined
      });
    } else {
      res.status(400).json({ 
        error: 'Failed to index materials',
        details: indexResult.errors 
      });
    }
  } catch (error) {
    console.error('[LOG rag_controller] ========= Error indexing materials:', error);
    res.status(500).json({ error: `Failed to index materials: ${error.message}` });
  }
};

/**
 * Delete indexed materials for a topic
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Status
 */
const deleteIndexedMaterials = async (req, res) => {
  try {
    const { topicId } = req.params;
    const userId = req.user.id;

    // Verify topic belongs to user
    const topic = await db.Topic.findOne({ where: { id: topicId, user_id: userId } });
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    // Delete indexed materials
    console.log(`[LOG rag_controller] ========= Deleting indexed materials for topic ${topicId}`);
    const success = await ragService.deleteIndexedMaterials(userId, topicId);

    if (success) {
      res.json({ message: 'Indexed materials deleted successfully' });
    } else {
      res.status(400).json({ error: 'Failed to delete indexed materials' });
    }
  } catch (error) {
    console.error('[LOG rag_controller] ========= Error deleting indexed materials:', error);
    res.status(500).json({ error: `Failed to delete indexed materials: ${error.message}` });
  }
};

/**
 * List all indexed topics for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - List of indexed topics
 */
const listIndexedTopics = async (req, res) => {
  try {
    const userId = req.user.id;

    // List collections
    console.log(`[LOG rag_controller] ========= Listing indexed topics for user ${userId}`);
    const collections = await ragService.listUserCollections(userId);

    // Get topic details
    const indexedTopics = [];
    for (const collection of collections) {
      const topic = await db.Topic.findOne({ where: { id: collection.topicId, user_id: userId } });
      if (topic) {
        indexedTopics.push({
          id: topic.id,
          title: topic.title,
          description: topic.description,
          vectorsCount: collection.vectors_count
        });
      }
    }

    res.json({
      message: 'Indexed topics retrieved successfully',
      topics: indexedTopics
    });
  } catch (error) {
    console.error('[LOG rag_controller] ========= Error listing indexed topics:', error);
    res.status(500).json({ error: `Failed to list indexed topics: ${error.message}` });
  }
};

/**
 * Extract text from a material
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Extracted text
 */
const extractTextFromMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;
    const userId = req.user.id;

    // Get material
    const material = await db.Material.findOne({ where: { id: materialId, user_id: userId } });
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    const filePath = path.join(__dirname, '../../uploads/materials', material.uploaded_file);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Material file not found' });
    }

    // Extract text
    console.log(`[LOG rag_controller] ========= Extracting text from material ${materialId}`);
    const text = await ragService.extractTextFromMaterial(filePath, material.file_type);

    res.json({
      message: 'Text extracted successfully',
      material: {
        id: material.id,
        fileName: material.file_name,
        fileType: material.file_type
      },
      text
    });
  } catch (error) {
    console.error('[LOG rag_controller] ========= Error extracting text from material:', error);
    res.status(500).json({ error: `Failed to extract text from material: ${error.message}` });
  }
};

// Validation rules
const generateNoteValidation = [
  check('title').notEmpty().withMessage('Title is required'),
  check('userGoal').notEmpty().withMessage('User goal is required'),
  check('topicId').notEmpty().withMessage('Topic ID is required')
];

module.exports = {
  generateNote,
  generateNoteValidation,
  searchMaterials,
  indexMaterials,
  deleteIndexedMaterials,
  listIndexedTopics,
  extractTextFromMaterial
}; 