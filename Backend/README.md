# UniHub Backend API

A robust Node.js backend API for the UniHub platform, built with clean architecture principles.

## Features

- Clean Architecture implementation
- JWT Authentication
- MySQL Database
- Swagger API Documentation
- Health Check Endpoint
- User Authentication (Sign up/Sign in)
- GitHub Actions CI/CD
- Automated Testing

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8 or higher)
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```
4. Create the database:
   ```bash
   mysql -u root -p
   CREATE DATABASE unihub_db;
   ```
5. Run migrations:
   ```bash
   npm run migrate
   ```

## Running the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Documentation

Once the server is running, visit:
```
http://localhost:3000/api-docs
```

## Available Endpoints

### Health Check
- `GET /api/v1/status` - Check API and database health

### Authentication
- `POST /api/v1/auth/signup` - Register a new user
- `POST /api/v1/auth/signin` - Login user

## Testing

Run tests:
```bash
npm test
```

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Request handlers
├── middleware/     # Custom middleware
├── models/        # Database models
├── routes/        # API routes
├── services/      # Business logic
├── utils/         # Utility functions
└── app.js         # Application entry point
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License. 