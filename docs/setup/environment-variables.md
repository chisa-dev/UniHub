# Environment Variables

This document describes all environment variables used in the UniHub application for both backend and frontend.

## Backend Environment Variables

### Server Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode (development, test, production) | `production` | Yes |
| `PORT` | Port number for the server | `3000` | No (defaults to 3000) |
| `API_URL` | Base URL for the API | `https://uni-hub-backend.vercel.app/api` | Yes in production |
| `FRONTEND_URL` | URL of the frontend application for CORS | `https://unihub-frontend.vercel.app` | Yes in production |

### Database Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `DB_HOST` | Database hostname | `aws-eu-west-1.connect.psdb.cloud` | Yes* |
| `DB_USER` | Database username | `adminuser` | Yes* |
| `DB_PASSWORD` | Database password | `p@ssw0rd123` | Yes* |
| `DB_NAME` | Database name | `unihub_db` | Yes* |
| `DATABASE_URL` | Full database connection string (alternative to individual DB params) | `mysql://adminuser:p@ssw0rd123@aws-eu-west-1.connect.psdb.cloud/unihub_db` | Yes* |

*Either individual DB parameters or `DATABASE_URL` must be provided.

### Authentication

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `JWT_SECRET` | Secret key for JWT token generation | `your-very-secret-key-that-should-be-long-and-complex` | Yes |
| `JWT_EXPIRES_IN` | JWT token expiration period | `7d` | No (defaults to 24h) |

### External Services

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `OPENAI_API_KEY` | OpenAI API key for AI features | `sk-...` | Yes for AI features |

## Frontend Environment Variables

### API Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://uni-hub-backend.vercel.app/api` | Yes |

### Authentication

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_AUTH_COOKIE_NAME` | Name of the cookie for storing auth token | `unihub_auth_token` | No (defaults to 'auth_token') |

### External Services

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_OPENAI_API_KEY` | OpenAI API key (if client-side AI processing is needed) | `sk-...` | No |

## Setting Up Environment Variables

### Development Environment

1. Create a `.env` file in the root directory of both backend and frontend projects
2. Add the required environment variables following the examples below

#### Backend .env Example

```
# Server Configuration
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000/api
FRONTEND_URL=http://localhost:5173

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=unihub_db

# Authentication
JWT_SECRET=your-development-secret-key
JWT_EXPIRES_IN=7d

# External Services
OPENAI_API_KEY=your-openai-api-key
```

#### Frontend .env Example

```
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Authentication
NEXT_PUBLIC_AUTH_COOKIE_NAME=unihub_auth_token
```

### Production Environment (Vercel)

For production deployment on Vercel, set environment variables through the Vercel dashboard:

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add each required variable with its corresponding value
4. Select the environments where each variable should be available (Production, Preview, Development)
5. Click "Save" to apply changes

Alternatively, you can use the Vercel CLI:

```bash
vercel env add API_URL https://uni-hub-backend.vercel.app/api
```

## Environment Variable Best Practices

1. **Never commit sensitive environment variables** to version control
2. Use different values for different environments (development, staging, production)
3. Regularly rotate sensitive credentials like API keys and database passwords
4. Limit the scope of variables to only the environments where they're needed
5. Use appropriate naming conventions (NEXT_PUBLIC_ prefix for client-exposed variables in Next.js)
6. Document any changes to required environment variables 