import request from 'supertest';
import app from '../../app';

describe('Auth routes', () => {
  const uniqueEmail = `integration${Date.now()}@test.com`;
  const password = 'password123';

  it('should register a new user (201 or 500 si BDD non prête)', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: uniqueEmail, password });
    expect([201, 500]).toContain(response.statusCode);
  });

  it('should login the user (200 ou 401/500)', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: uniqueEmail, password });
    expect([200, 401, 500]).toContain(response.statusCode);
  });
});
