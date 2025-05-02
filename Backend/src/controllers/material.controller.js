const db = require('../models');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { Op } = require('sequelize');
const ragService = require('../services/rag'); // Add RAG service import

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/materials');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueFilename = `${Date.now()}_${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

// Filter for allowed file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf', // pdf
    'image/jpeg', 'image/png', 'image/gif', // images
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', // ppt/pptx
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // doc/docx
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, images, PowerPoint, and Word documents are allowed.'), false);
  }
};

// Configure multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
}).single('file');

// Helper to get file type
const getFileType = (mimetype) => {
  if (mimetype.includes('pdf')) return 'pdf';
  if (mimetype.includes('image')) return 'image';
  if (mimetype.includes('presentation') || mimetype.includes('powerpoint')) return 'ppt';
  if (mimetype.includes('word') || mimetype.includes('document')) return 'docx';
  return 'unknown';
};

// Create a new material
exports.uploadMaterial = async (req, res) => {
  try {
    // Use multer to handle file upload
    upload(req, res, async function(err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: `Upload error: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }

      // Check if user is authenticated
      if (!req.user) {
        // Remove uploaded file if user is not authenticated
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(401).json({ message: 'Authentication required to upload materials' });
      }

      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      // Check if topicId was provided
      const { topicId } = req.body;
      if (!topicId) {
        // Remove uploaded file if topicId is missing
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: 'Topic ID is required' });
      }

      // Check if topic exists
      const topic = await db.Topic.findOne({
        where: {
          id: topicId,
          user_id: req.user.id // Only allow uploading to topics owned by the user
        }
      });
      
      if (!topic) {
        // Remove uploaded file if topic doesn't exist or user doesn't have access
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: 'Topic not found or you do not have permission to upload to this topic' });
      }

      // Create new material record
      const material = await db.Material.create({
        id: uuidv4(),
        user_id: req.user.id, // Add user_id from authentication token
        topic_id: topicId,
        file_name: req.file.originalname,
        uploaded_file: req.file.filename,
        file_type: getFileType(req.file.mimetype),
        file_size: req.file.size
      });

      // Generate file URL
      const fileUrl = `${req.protocol}://${req.get('host')}/materials/${req.file.filename}`;

      // Index the newly uploaded material for RAG retrieval
      try {
        console.log(`[LOG material_upload] ========= Indexing material ${material.id} for topic ${topicId}`);
        // Index the material immediately in background
        indexMaterialInBackground(material, req.user.id, topicId);
      } catch (indexError) {
        console.error('[LOG material_upload] ========= Error while setting up material indexing:', indexError);
        // Don't fail the upload if indexing setup fails
      }

      res.status(201).json({
        message: 'Material uploaded successfully',
        material: {
          ...material.toJSON(),
          fileUrl
        }
      });
    });
  } catch (error) {
    console.error('[LOG material_upload] ========= Error uploading material:', error);
    res.status(500).json({ 
      message: 'Error uploading material',
      error: error.message
    });
  }
};

/**
 * Index a material in the background to avoid blocking the upload response
 * @param {Object} material - The material object to index
 * @param {string} userId - User ID
 * @param {string} topicId - Topic ID
 */
const indexMaterialInBackground = async (material, userId, topicId) => {
  try {
    // Create a collection name using the same format as in the RAG service
    const collectionName = `user_${userId}_topic_${topicId}`;
    
    console.log(`[LOG material_index] ========= Starting background indexing for material ${material.id} in collection ${collectionName}`);
    
    // Call the indexMaterials function with just this material
    const indexResult = await ragService.indexMaterials([material], userId, topicId);
    
    if (indexResult.success) {
      console.log(`[LOG material_index] ========= Successfully indexed material ${material.id} for topic ${topicId}`);
      console.log(`[LOG material_index] ========= Index result: ${JSON.stringify({
        collectionName: indexResult.collectionName,
        materialsAdded: indexResult.materialsAdded,
        collectionCreated: indexResult.collectionCreated,
        collectionExisted: indexResult.collectionExisted
      })}`);
    } else {
      console.error(`[LOG material_index] ========= Failed to index material ${material.id} for topic ${topicId}`);
      console.error(`[LOG material_index] ========= Error: ${indexResult.error || JSON.stringify(indexResult.errors)}`);
    }
  } catch (error) {
    console.error(`[LOG material_index] ========= Error indexing material ${material?.id || 'unknown'} in background:`, error);
  }
};

// Get all materials
exports.getAllMaterials = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required to access materials' });
    }

    const materials = await db.Material.findAll({
      where: { user_id: req.user.id }, // Filter by current user
      include: [{
        model: db.Topic,
        as: 'topic',
        attributes: ['id', 'title', 'user_id'],
        include: [{
          model: db.User,
          as: 'creator',
          attributes: ['id']
        }]
      }]
    });

    // Add file URLs to each material
    const materialsWithUrls = materials.map(material => {
      const fileUrl = `${req.protocol}://${req.get('host')}/materials/${material.uploaded_file}`;
      return {
        ...material.toJSON(),
        fileUrl,
        user_id: material.topic?.user_id || null
      };
    });

    res.status(200).json(materialsWithUrls);
  } catch (error) {
    console.error('[LOG get_all_materials] ========= Error getting materials:', error);
    res.status(500).json({ 
      message: 'Error getting materials',
      error: error.message
    });
  }
};

// Get materials by topic ID
exports.getMaterialsByTopic = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required to access materials' });
    }
    
    const { topicId } = req.params;
    
    // Check if topic exists and is accessible to the user
    // Either it belongs to the current user or it's public
    const topic = await db.Topic.findOne({
      where: {
        id: topicId,
        [Op.or]: [
          { user_id: req.user.id },
          { is_public: true }
        ]
      }
    });
    
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found or not accessible' });
    }
    
    // If topic is public but not owned by the user, only show materials owned by the topic creator
    // If topic is owned by the user, show their materials for this topic
    const whereClause = topic.user_id === req.user.id
      ? { topic_id: topicId, user_id: req.user.id }
      : { topic_id: topicId, user_id: topic.user_id };
    
    const materials = await db.Material.findAll({
      where: whereClause
    });

    // Add file URLs to each material
    const materialsWithUrls = materials.map(material => {
      const fileUrl = `${req.protocol}://${req.get('host')}/materials/${material.uploaded_file}`;
      return {
        ...material.toJSON(),
        fileUrl,
        user_id: topic.user_id || null
      };
    });

    res.status(200).json(materialsWithUrls);
  } catch (error) {
    console.error('[LOG get_materials_by_topic] ========= Error getting materials by topic:', error);
    res.status(500).json({ 
      message: 'Error getting materials by topic',
      error: error.message
    });
  }
};

// Get material by ID
exports.getMaterialById = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required to access materials' });
    }
    
    const { id } = req.params;
    
    const material = await db.Material.findOne({
      where: {
        id: id,
        user_id: req.user.id // Only return materials owned by the current user
      },
      include: [{
        model: db.Topic,
        as: 'topic',
        attributes: ['id', 'title', 'user_id'],
        include: [{
          model: db.User,
          as: 'creator',
          attributes: ['id']
        }]
      }]
    });
    
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // Add file URL
    const fileUrl = `${req.protocol}://${req.get('host')}/materials/${material.uploaded_file}`;
    
    res.status(200).json({
      ...material.toJSON(),
      fileUrl,
      user_id: material.topic?.user_id || null
    });
  } catch (error) {
    console.error('[LOG get_material_by_id] ========= Error getting material:', error);
    res.status(500).json({ 
      message: 'Error getting material',
      error: error.message
    });
  }
};

// Delete material by ID
exports.deleteMaterial = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required to delete materials' });
    }
    
    const { id } = req.params;
    
    const material = await db.Material.findOne({
      where: {
        id: id,
        user_id: req.user.id
      }
    });
    
    if (!material) {
      return res.status(404).json({ message: 'Material not found or you do not have permission to delete it' });
    }
    
    // Delete file from storage
    const filePath = path.join(__dirname, '../../uploads/materials', material.uploaded_file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Delete record from database
    await material.destroy();
    
    res.status(200).json({ message: 'Material deleted successfully' });
  } catch (error) {
    console.error('[LOG delete_material] ========= Error deleting material:', error);
    res.status(500).json({ 
      message: 'Error deleting material',
      error: error.message
    });
  }
};

// Delete all materials by topic ID
exports.deleteMaterialsByTopic = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required to delete materials' });
    }
    
    const { topicId } = req.params;
    
    // Check if topic exists and belongs to the current user
    const topic = await db.Topic.findOne({
      where: {
        id: topicId,
        user_id: req.user.id
      }
    });
    
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found or you do not have permission to delete its materials' });
    }
    
    // Get all materials for the topic
    const materials = await db.Material.findAll({
      where: { 
        topic_id: topicId,
        user_id: req.user.id
      }
    });
    
    // Delete files from storage
    for (const material of materials) {
      const filePath = path.join(__dirname, '../../uploads/materials', material.uploaded_file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    // Delete records from database
    await db.Material.destroy({
      where: { 
        topic_id: topicId,
        user_id: req.user.id
      }
    });
    
    res.status(200).json({ 
      message: 'All materials for topic deleted successfully',
      count: materials.length
    });
  } catch (error) {
    console.error('[LOG delete_materials_by_topic] ========= Error deleting materials by topic:', error);
    res.status(500).json({ 
      message: 'Error deleting materials by topic',
      error: error.message
    });
  }
}; 