/**
 * RAG Service Tests
 * Tests for the Retrieval-Augmented Generation service
 */

require('dotenv').config();
const ragService = require('../services/rag');
const vectorStore = require('../services/rag/utils/vectorStore');
const documentProcessor = require('../services/rag/utils/documentProcessor');
const { v4: uuidv4 } = require('uuid');

// Simple test data
const testEmbedding = new Array(1536).fill(0.1);
const testCollection = `test_collection_${Date.now()}`;
const testDocument = {
  id: uuidv4(), // Use a valid UUID for the test
  content: 'This is a test document for UniHub RAG service.',
  metadata: {
    fileName: 'test.txt',
    materialId: 'test-material-1',
    userId: 'test-user-1',
    topicId: 'test-topic-1'
  },
  embedding: testEmbedding
};

/**
 * Main test function
 */
const runTests = async () => {
  console.log('Starting RAG service tests...');

  try {
    // Test 1: Create a collection
    console.log('\nTest 1: Creating collection...');
    const collectionCreated = await vectorStore.createCollection(testCollection);
    console.log(`Collection created: ${collectionCreated}`);

    // Test 2: Add a document
    console.log('\nTest 2: Adding document...');
    const documentAdded = await vectorStore.addDocuments(testCollection, [testDocument]);
    console.log(`Document added: ${documentAdded}`);

    // Test 3: Search for documents
    console.log('\nTest 3: Searching documents...');
    const searchResults = await vectorStore.search(testCollection, testEmbedding, 5, 0.5);
    console.log(`Found ${searchResults.length} documents`);
    console.log('First result:', searchResults[0] ? {
      id: searchResults[0].id,
      content: searchResults[0].content,
      score: searchResults[0].score
    } : 'No results');

    // Skip embedding test if no OpenAI API key
    console.log('\nTest 4: Checking for OpenAI API key...');
    if (!process.env.OPENAI_API_KEY) {
      console.log('Skipping embedding generation test - no OpenAI API key found');
    } else {
      // Test 4: Generate an embedding
      console.log('Generating embedding...');
      try {
        const embedding = await documentProcessor.generateEmbedding('Test embedding generation');
        console.log(`Embedding generated with length ${embedding.length}`);
      } catch (error) {
        console.error('Error generating embedding:', error.message);
      }
    }

    // Test 5: Delete collection
    console.log('\nTest 5: Deleting collection...');
    const collectionDeleted = await vectorStore.deleteCollection(testCollection);
    console.log(`Collection deleted: ${collectionDeleted}`);

    console.log('\nAll tests completed!');
  } catch (error) {
    console.error('Test failed:', error);
  }
};

// Run the tests if this file is executed directly
if (require.main === module) {
  runTests()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Tests failed with error:', err);
      process.exit(1);
    });
}

module.exports = runTests; 