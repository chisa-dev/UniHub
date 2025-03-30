const request = require('supertest');
const app = require('../app');

describe('Status Endpoint', () => {
  it('should return API and database status', async () => {
    const res = await request(app)
      .get('/api/v1/status');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('database', 'connected');
    expect(res.body).toHaveProperty('timestamp');
  });
}); 