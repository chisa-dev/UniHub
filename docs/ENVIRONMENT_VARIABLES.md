# UniHub Backend Environment Variables

This document lists all environment variables required for the UniHub backend application.

## Required Environment Variables

### Server Configuration
- `NODE_ENV`: Environment mode (development, test, production)
- `PORT`: Port number for the server (default: 3000)
- `API_URL`: Base URL for the API (e.g., https://uni-hub-backend.vercel.app/api)
- `FRONTEND_URL`: URL of the frontend application for CORS (e.g., https://unihub-frontend.vercel.app)

### Database Configuration
- `DB_HOST`: Database hostname
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name
- `DATABASE_URL`: (Alternative) Full database connection string 

### JWT Configuration
- `JWT_SECRET`: Secret key for JWT token generation and validation
- `JWT_EXPIRES_IN`: JWT token expiration period (e.g., 7d, 24h)

### AI Features (if applicable)
- `OPENAI_API_KEY`: OpenAI API key for AI assistant features

## Environment-Specific Configuration

### Development
```
NODE_ENV=development
API_URL=http://localhost:3000/api
FRONTEND_URL=http://localhost:5173
```

### Production
```
NODE_ENV=production
API_URL=https://uni-hub-backend.vercel.app/api
FRONTEND_URL=https://unihub-frontend.vercel.app
```

## Setting Environment Variables on Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add each required variable with its corresponding value
4. Click "Save" to apply changes

Alternatively, you can use the Vercel CLI:
```bash
vercel env add API_URL https://uni-hub-backend.vercel.app/api
```

## Using Environment Variables in Code

```javascript
// Example
const apiUrl = process.env.API_URL || 'http://localhost:3000/api';
``` 