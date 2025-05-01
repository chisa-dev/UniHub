const db = require('../models');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

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
      const topic = await db.Topic.findByPk(topicId);
      if (!topic) {
        // Remove uploaded file if topic doesn't exist
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: 'Topic not found' });
      }

      // Create new material record
      const material = await db.Material.create({
        id: uuidv4(),
        topic_id: topicId,
        file_name: req.file.originalname,
        uploaded_file: req.file.filename,
        file_type: getFileType(req.file.mimetype),
        file_size: req.file.size
      });

      // Generate file URL
      const fileUrl = `${req.protocol}://${req.get('host')}/materials/${req.file.filename}`;

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

// Get all materials
exports.getAllMaterials = async (req, res) => {
  try {
    const materials = await db.Material.findAll({
      include: [{
        model: db.Topic,
        as: 'topic',
        attributes: ['id', 'title']
      }]
    });

    // Add file URLs to each material
    const materialsWithUrls = materials.map(material => {
      const fileUrl = `${req.protocol}://${req.get('host')}/materials/${material.uploaded_file}`;
      return {
        ...material.toJSON(),
        fileUrl
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
    const { topicId } = req.params;
    
    // Check if topic exists
    const topic = await db.Topic.findByPk(topicId);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    
    const materials = await db.Material.findAll({
      where: { topic_id: topicId }
    });

    // Add file URLs to each material
    const materialsWithUrls = materials.map(material => {
      const fileUrl = `${req.protocol}://${req.get('host')}/materials/${material.uploaded_file}`;
      return {
        ...material.toJSON(),
        fileUrl
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
    const { id } = req.params;
    
    const material = await db.Material.findByPk(id, {
      include: [{
        model: db.Topic,
        as: 'topic',
        attributes: ['id', 'title']
      }]
    });
    
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // Add file URL
    const fileUrl = `${req.protocol}://${req.get('host')}/materials/${material.uploaded_file}`;
    
    res.status(200).json({
      ...material.toJSON(),
      fileUrl
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
    const { id } = req.params;
    
    const material = await db.Material.findByPk(id);
    
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
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
    const { topicId } = req.params;
    
    // Check if topic exists
    const topic = await db.Topic.findByPk(topicId);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    
    // Get all materials for the topic
    const materials = await db.Material.findAll({
      where: { topic_id: topicId }
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
      where: { topic_id: topicId }
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