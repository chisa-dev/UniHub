# API Overview

This document provides an overview of the RESTful API services provided by the UniHub backend.

## API Base URL

- Development: `http://localhost:3000/api`
- Production: `https://uni-hub-backend.vercel.app/api`

## Authentication

Most API endpoints require authentication via a JSON Web Token (JWT). To authenticate requests:

1. Obtain a token via the `/api/auth/login` endpoint
2. Include the token in the Authorization header of subsequent requests:
   ```
   Authorization: Bearer <your_token>
   ```

## API Documentation

The API is documented using Swagger/OpenAPI. You can access the interactive documentation at:

- Development: `http://localhost:3000/api-docs`
- Production: `https://uni-hub-backend.vercel.app/api-docs`

## API Endpoints

### Health Check and Status

| Method | Endpoint | Description | Authentication Required |
|--------|----------|-------------|------------------------|
| GET | `/api/status` | Check API and database health | No |

### Authentication

| Method | Endpoint | Description | Authentication Required |
|--------|----------|-------------|------------------------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login and get access token | No |
| GET | `/api/auth/profile` | Get current user profile | Yes |
| PUT | `/api/auth/profile` | Update user profile | Yes |
| POST | `/api/auth/refresh` | Refresh access token | Yes |

### Topics

| Method | Endpoint | Description | Authentication Required |
|--------|----------|-------------|------------------------|
| GET | `/api/topics` | Get all topics | Yes |
| POST | `/api/topics` | Create a new topic | Yes |
| GET | `/api/topics/:id` | Get a specific topic | Yes |
| PUT | `/api/topics/:id` | Update a topic | Yes |
| DELETE | `/api/topics/:id` | Delete a topic | Yes |

### Quizzes

| Method | Endpoint | Description | Authentication Required |
|--------|----------|-------------|------------------------|
| GET | `/api/quizzes` | Get all quizzes | Yes |
| POST | `/api/quizzes` | Create a new quiz | Yes |
| GET | `/api/quizzes/:id` | Get a specific quiz | Yes |
| PUT | `/api/quizzes/:id` | Update a quiz | Yes |
| DELETE | `/api/quizzes/:id` | Delete a quiz | Yes |
| POST | `/api/quizzes/:id/attempt` | Submit a quiz attempt | Yes |
| GET | `/api/quizzes/:id/attempts` | Get quiz attempts | Yes |

### Notes

| Method | Endpoint | Description | Authentication Required |
|--------|----------|-------------|------------------------|
| GET | `/api/notes` | Get all notes | Yes |
| POST | `/api/notes` | Create a new note | Yes |
| GET | `/api/notes/:id` | Get a specific note | Yes |
| PUT | `/api/notes/:id` | Update a note | Yes |
| DELETE | `/api/notes/:id` | Delete a note | Yes |
| POST | `/api/notes/:id/share` | Share a note with other users | Yes |

### Calendar

| Method | Endpoint | Description | Authentication Required |
|--------|----------|-------------|------------------------|
| GET | `/api/calendar/events` | Get all calendar events | Yes |
| POST | `/api/calendar/events` | Create a new calendar event | Yes |
| GET | `/api/calendar/events/:id` | Get a specific calendar event | Yes |
| PUT | `/api/calendar/events/:id` | Update a calendar event | Yes |
| DELETE | `/api/calendar/events/:id` | Delete a calendar event | Yes |

### Tutoring

| Method | Endpoint | Description | Authentication Required |
|--------|----------|-------------|------------------------|
| GET | `/api/tutoring/sessions` | Get all tutoring sessions | Yes |
| POST | `/api/tutoring/sessions` | Create a new tutoring session | Yes |
| GET | `/api/tutoring/sessions/:id` | Get a specific tutoring session | Yes |
| PUT | `/api/tutoring/sessions/:id` | Update a tutoring session | Yes |
| DELETE | `/api/tutoring/sessions/:id` | Delete a tutoring session | Yes |
| GET | `/api/tutoring/tutors` | Get all available tutors | Yes |
| GET | `/api/tutoring/tutors/:id` | Get a specific tutor's details | Yes |


### AI Assistant

| Method | Endpoint | Description | Authentication Required |
|--------|----------|-------------|------------------------|
| POST | `/api/ai-assistant/chat` | Send a message to the AI assistant | Yes |
| POST | `/api/ai-assistant/generate-quiz` | Generate a quiz with AI | Yes |
| POST | `/api/ai-assistant/summarize` | Summarize content with AI | Yes |
| POST | `/api/ai-assistant/recommend` | Get AI-powered recommendations | Yes |

## Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "data": {
    // Response data here
  },
  "message": "Operation successful",
  "success": true
}
```

### Error Response

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": {} // Optional additional error details
  },
  "success": false
}
```

## Common HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | OK - The request was successful |
| 201 | Created - A new resource was successfully created |
| 400 | Bad Request - The request was malformed or invalid |
| 401 | Unauthorized - Authentication is required or failed |
| 403 | Forbidden - The authenticated user doesn't have permission |
| 404 | Not Found - The requested resource was not found |
| 409 | Conflict - The request conflicts with the current state |
| 500 | Internal Server Error - Something went wrong on the server |

## Rate Limiting

API requests are rate-limited to ensure fair usage and system stability:

- 100 requests per minute per IP address
- 1000 requests per hour per user

Exceeding these limits will result in a 429 (Too Many Requests) response.

## Versioning

The current API version is v1, which is implicit in the endpoints. Future versions will use explicit versioning in the URL:

```
/api/v2/resource
```

## Cross-Origin Resource Sharing (CORS)

The API supports CORS for specified origins:

- Development: `http://localhost:5173`
- Production: `https://unihub-frontend.vercel.app`

Additional origins can be configured via the `FRONTEND_URL` environment variable. 