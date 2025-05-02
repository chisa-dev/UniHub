# RAG Service for UniHub

This directory contains the implementation of a Retrieval-Augmented Generation (RAG) service for UniHub, powering intelligent content generation and search capabilities.

## Overview

RAG (Retrieval-Augmented Generation) combines traditional information retrieval with generative AI to produce more accurate, relevant, and fact-based outputs. The UniHub RAG service enables:

1. **Smart Note Generation**: Automatically generate comprehensive educational notes based on learning materials.
2. **Semantic Search**: Search through learning materials using natural language queries.
3. **Vector Storage**: Index and retrieve educational content using vector embeddings.

## Architecture

The RAG service consists of the following components:

```
rag/
├── models/
│   └── noteGenerator.js    # Note generation using RAG
├── utils/
│   ├── documentProcessor.js # Document processing and embedding generation
│   └── vectorStore.js      # Vector storage using Qdrant
└── index.js                # Main entry point for the RAG service
```

## Key Components

### Vector Store (Qdrant)

The service uses [Qdrant](https://qdrant.tech/), a vector similarity search engine, for storing and retrieving embeddings. The implementation:

- Creates collections for each user's topic materials
- Stores document chunks with metadata
- Performs similarity search with filtering

### Document Processing

The document processor handles:

- Extracting text from various file formats (PDF, DOCX, etc.)
- Chunking text into manageable segments
- Generating embeddings using OpenAI's embedding API

### Note Generation

The note generator:

- Indexes learning materials for specific users and topics
- Retrieves relevant content based on the user's query
- Uses OpenAI to generate comprehensive notes with proper structure

## Usage

The RAG service is exposed through the `/api/rag` endpoint with the following routes:

- `POST /api/rag/notes`: Generate a note using RAG
- `GET /api/rag/search`: Search materials for a topic
- `POST /api/rag/index/:topicId`: Index materials for a topic
- `DELETE /api/rag/index/:topicId`: Delete indexed materials for a topic
- `GET /api/rag/indexed-topics`: List all indexed topics for a user
- `GET /api/rag/extract/:materialId`: Extract text from a material

## Testing

Run the test script to verify the RAG service is working correctly:

```bash
node test-rag.js
``` 