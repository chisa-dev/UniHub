const request = require('supertest');
const app = require('../app');
const db = require('../config/database');

describe('Authentication Endpoints', () => {
  beforeAll(async () => {
    // Clear users table before tests
    await db.query('DELETE FROM users');
  });

  afterAll(async () => {
    // Clear users table after tests
    await db.query('DELETE FROM users');
  });

  describe('POST /api/v1/auth/signup', () => {
    it('should create a new user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          username: 'johndoe',
          password: 'password123'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body).toHaveProperty('userId');
    });

    it('should not create user with existing username', async () => {
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          username: 'johndoe',
          password: 'password123'
        });

      expect(res.statusCode).toBe(409);
      expect(res.body).toHaveProperty('status', 'error');
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          firstName: 'John'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('status', 'error');
      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('POST /api/v1/auth/signin', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/signin')
        .send({
          username: 'johndoe',
          password: 'password123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
    });

    it('should not login with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/signin')
        .send({
          username: 'johndoe',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('status', 'error');
    });
  });
}); 