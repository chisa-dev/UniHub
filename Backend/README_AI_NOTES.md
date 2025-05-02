# AI-Powered Notes in UniHub

This document describes the AI-Powered Notes feature in UniHub, which allows users to generate comprehensive educational notes based on their learning goals and existing study materials.

## Overview

The AI Notes feature leverages OpenAI to analyze existing study materials associated with a topic and generate well-structured, informative notes based on the user's specific learning goals.

## API Endpoints

### Create an AI-Generated Note

**Endpoint:** `POST /api/notes`

**Description:** Creates a new note using AI generation based on materials associated with the specified topic.

**Authentication:** JWT token required

**Request Body:**
```json
{
  "title": "The Physics of Black Holes",
  "user_goal": "I want to understand the formation and behavior of black holes for my astrophysics course",
  "topicId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "isPrivate": true
}
```

**Required Fields:**
- `title`: The title of the note
- `user_goal`: The user's specific learning goal or objective
- `topicId`: The ID of the topic to which the note belongs (materials from this topic will be used for AI generation)

**Optional Fields:**
- `isPrivate`: Whether the note is private (default: true)

**Response:** (Status 201)
```json
{
  "id": "46b2af2f-98de-4202-bebb-35b66968ab75",
  "title": "The Physics of Black Holes",
  "topic": "Astrophysics",
  "topicId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "date": "May 10, 2023",
  "content": "# Black Holes: From Formation to Evaporation\n\n## Introduction\n\nBlack holes represent one of the most fascinating...",
  "readTime": "8 min read",
  "created_at": "2023-05-10T15:30:45.000Z",
  "updated_at": "2023-05-10T15:30:45.000Z",
  "user_id": "9105f3ec-9d2a-4d52-8b89-b55b53016c84",
  "user_goal": "I want to understand the formation and behavior of black holes for my astrophysics course"
}
```

### Get a Note by ID

**Endpoint:** `GET /api/notes/:id`

**Description:** Retrieves a specific note by its ID.

**Authentication:** JWT token required

**Response:** (Status 200)
```json
{
  "id": "46b2af2f-98de-4202-bebb-35b66968ab75",
  "title": "The Physics of Black Holes",
  "topic": "Astrophysics",
  "topicId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "date": "May 10, 2023",
  "content": "# Black Holes: From Formation to Evaporation\n\n## Introduction\n\nBlack holes represent one of the most fascinating...",
  "readTime": "8 min read",
  "created_at": "2023-05-10T15:30:45.000Z",
  "updated_at": "2023-05-10T15:30:45.000Z",
  "user_id": "9105f3ec-9d2a-4d52-8b89-b55b53016c84",
  "user_goal": "I want to understand the formation and behavior of black holes for my astrophysics course"
}
```

### Get All Notes

**Endpoint:** `GET /api/notes`

**Description:** Retrieves all notes for the current user.

**Authentication:** JWT token required

**Query Parameters:**
- `page`: Page number for pagination (default: 1)
- `limit`: Number of notes per page (default: 10)
- `topicId`: (Optional) Filter notes by topic ID

**Response:** (Status 200)
```json
{
  "notes": [
    {
      "id": "46b2af2f-98de-4202-bebb-35b66968ab75",
      "title": "The Physics of Black Holes",
      "topic": "Astrophysics",
      "topicId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "date": "May 10, 2023",
      "content": "# Black Holes: From Formation to Evaporation\n\n## Introduction\n\nBlack holes represent one of the most fascinating...",
      "readTime": "8 min read",
      "created_at": "2023-05-10T15:30:45.000Z",
      "updated_at": "2023-05-10T15:30:45.000Z",
      "user_id": "9105f3ec-9d2a-4d52-8b89-b55b53016c84"
    },
    // More notes here...
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "totalPages": 3
  }
}
```

### Get Notes by Topic

**Endpoint:** `GET /api/notes/topic/:topicId`

**Description:** Retrieves all notes for a specific topic.

**Authentication:** JWT token required

**Parameters:**
- `topicId`: ID of the topic to get notes for

**Query Parameters:**
- `page`: Page number for pagination (default: 1)
- `limit`: Number of notes per page (default: 10)

**Response:** (Status 200)
```json
{
  "notes": [
    {
      "id": "46b2af2f-98de-4202-bebb-35b66968ab75",
      "title": "The Physics of Black Holes",
      "topic": "Astrophysics",
      "topicId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "date": "May 10, 2023",
      "content": "# Black Holes: From Formation to Evaporation\n\n## Introduction\n\nBlack holes represent one of the most fascinating...",
      "readTime": "8 min read",
      "created_at": "2023-05-10T15:30:45.000Z",
      "updated_at": "2023-05-10T15:30:45.000Z",
      "user_id": "9105f3ec-9d2a-4d52-8b89-b55b53016c84"
    },
    // More notes for this topic here...
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "totalPages": 1
  }
}
```

## Implementation Details

### How It Works

1. When a user creates a note with a specific topic ID:
   - The system gathers all materials associated with that topic
   - Text is extracted from these materials based on file type (PDF, DOCX, PPT, etc.)
   
2. The extracted text, along with the user's title and goal, is sent to OpenAI:
   - The AI generates comprehensive, well-structured notes
   - The content is formatted in Markdown for easy rendering
   
3. The generated note is stored in the database with:
   - The original title and user goal
   - The AI-generated content
   - An automatically calculated reading time

### Supported Material Types

- PDF documents (full text extraction)
- Word documents (DOCX) (full text extraction)
- PowerPoint presentations (PPT/PPTX) (reference only)
- Images (reference only)

## Technical Considerations

- OpenAI API key is required in the `.env` file
- Maximum content length from materials is limited to prevent token limits
- Error handling is implemented to gracefully handle API failures

## Integration with Front-End

Front-end applications can render the notes using any Markdown renderer. The `content` field contains standard Markdown that can be rendered with libraries like:

- React-Markdown
- Marked.js
- Showdown

## Development Roadmap

Future enhancements planned for AI Notes include:

1. Support for code syntax highlighting in generated notes
2. OCR for image-based materials
3. More advanced extraction from PowerPoint presentations
4. Additional AI models and options 