# Authentication System Documentation

## Overview
UniHub implements a secure authentication system using JWT (JSON Web Tokens) for user authentication and authorization. The system includes both sign-up and sign-in functionality with proper validation and security measures.

## Security Features

### Password Security
- Passwords are hashed using bcrypt with a salt round of 10
- Passwords are never stored in plain text
- Minimum password length requirement of 6 characters

### JWT Implementation
- JWT tokens are used for secure authentication
- Tokens include user ID and username
- Tokens have a configurable expiration time (set via JWT_EXPIRES_IN environment variable)
- Tokens are signed with a secret key (JWT_SECRET environment variable)

## Input Validation

### Sign-up Validation
The following validations are performed during user registration:
- First Name:
  - Required field
  - Length between 2-50 characters
  - Trimmed of whitespace
- Last Name:
  - Required field
  - Length between 2-50 characters
  - Trimmed of whitespace
- Username:
  - Required field
  - Length between 3-30 characters
  - Only allows letters, numbers, and underscores
  - Must be unique in the system
- Password:
  - Required field
  - Minimum length of 6 characters

### Sign-in Validation
The following validations are performed during login:
- Username: Required field
- Password: Required field

## API Endpoints

### Sign-up Endpoint
```
POST /api/v1/auth/signup
```
- Creates a new user account
- Returns 201 on success
- Returns 409 if username already exists
- Returns 400 for validation errors
- Returns 500 for server errors

### Sign-in Endpoint
```
POST /api/v1/auth/signin
```
- Authenticates user credentials
- Returns 200 with JWT token on success
- Returns 401 for invalid credentials
- Returns 500 for server errors

## Frontend Implementation
The frontend provides user-friendly forms for both sign-up and sign-in:
- Form validation for required fields
- Error handling and display
- Secure password input fields
- Responsive design for all screen sizes

## Testing
The authentication system includes comprehensive test coverage:
- User registration tests
- Login tests
- Validation tests
- Error handling tests
- Duplicate username tests

## Security Best Practices
1. All passwords are hashed before storage
2. JWT tokens are used for stateless authentication
3. Input validation on both client and server side
4. Secure password requirements
5. Protection against SQL injection through parameterized queries
6. Environment variables for sensitive data
7. Error messages that don't expose system details

## Environment Variables
Required environment variables for authentication:
- `JWT_SECRET`: Secret key for JWT signing
- `JWT_EXPIRES_IN`: Token expiration time
- Database connection details

## Error Handling
The system implements proper error handling for various scenarios:
- Invalid credentials
- Duplicate usernames
- Validation errors
- Server errors
- Database errors

## Future Improvements
Potential areas for enhancement:
1. Password reset functionality
2. Email verification
3. Two-factor authentication
4. Rate limiting for login attempts
5. Session management
6. OAuth integration for social login
