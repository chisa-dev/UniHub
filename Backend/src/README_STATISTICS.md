# UniHub Statistics System

This document describes the statistics tracking system implemented in UniHub. The system is designed to track user progress in various learning activities and provide comprehensive statistics.

## Database Schema

The statistics system consists of four main tables:

1. **study_sessions**: Tracks user study sessions with duration and productivity scores
2. **topic_progress**: Tracks user progress in topics
3. **quiz_progress**: Tracks user progress and performance in quizzes
4. **note_progress**: Tracks user progress in reading notes

## API Endpoints

The statistics API includes the following endpoints:

### GET /api/statistics

Retrieves comprehensive statistics for the authenticated user, including:
- Topic progress
- Quiz progress
- Note progress
- Study hours (last 7 days)
- Summary statistics (averages, totals, etc.)

### PUT /api/statistics/topics

Updates progress for a specific topic. Required parameters:
- `topicId`: ID of the topic
- `progress`: A value between 0 and 100
- `materialsCount` (optional): Count of materials uploaded for this topic

### PUT /api/statistics/quizzes

Updates progress for a specific quiz. Required parameters:
- `quizId`: ID of the quiz
- `progress`: A value between 0 and 100
- `score` (optional): The score achieved in the quiz

### PUT /api/statistics/notes

Updates progress for a specific note. Required parameters:
- `noteId`: ID of the note
- `progress`: A value between 0 and 100
- `lastReadPosition` (optional): Position in characters where the user stopped reading

### POST /api/statistics/study-sessions

Logs a study session. Required parameters:
- `hours`: Duration of the study session (0-24)
- `date` (optional): Date of the study session (defaults to today)
- `productivityScore` (optional): Self-rated productivity score (0-100)
- `notes` (optional): Notes about the study session

## Implementation Details

### Progress Tracking

Progress is tracked as a percentage (0-100) for each learning activity:
- For topics, progress represents completion of the topic content
- For quizzes, progress represents the portion of questions answered
- For notes, progress represents the portion of content read

### Study Sessions

Study sessions track:
- Date
- Duration in hours
- Productivity score
- Optional notes

The system only keeps the last 7 days of study sessions for the dashboard display.

### Materials Count

For topics, the system tracks how many study materials have been uploaded or associated with each topic.

## Using the Statistics System

Frontend clients should:

1. Update progress whenever users interact with learning content
2. Log study sessions when users start/stop studying
3. Fetch statistics for dashboard displays

## Running Migrations

To create the necessary database tables, run:

```bash
node src/migrations/run_migrations.js
```

## Future Enhancements

Potential future enhancements to the statistics system:
- Learning streak tracking
- More detailed analytics (time of day, duration per topic, etc.)
- Goal setting and achievement tracking
- Learning patterns and recommendations 