/**
 * RAG Service Test Runner
 * 
 * This script tests the Qdrant-powered RAG service implementation.
 * It verifies:
 * 1. Collection creation in Qdrant
 * 2. Document storage with valid UUIDs
 * 3. Vector similarity search 
 * 4. Embedding generation (OpenAI/mock)
 * 5. Collection deletion
 */

require('dotenv').config();
const ragTest = require('./src/tests/rag.test');

console.log('=============================================================');
console.log('|| UniHub RAG Service Test - Testing Qdrant Implementation ||');
console.log('=============================================================');
console.log('Notes:');
console.log('- Mock embeddings are used if OPENAI_API_KEY is not set in .env');
console.log('- The test will create and then delete a test collection in Qdrant');
console.log('- Connection errors may occur if Qdrant credentials are invalid');
console.log('=============================================================\n');

ragTest()
  .then(() => {
    console.log('\n=============================================================');
    console.log('RAG service test completed successfully!');
    console.log('The service is ready to be used in the application.');
    console.log('=============================================================');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n=============================================================');
    console.error('RAG service test failed with error:');
    console.error(err);
    console.error('=============================================================');
    process.exit(1);
  }); 