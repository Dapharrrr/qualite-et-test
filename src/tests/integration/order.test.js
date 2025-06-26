import request from 'supertest';
import app from '../../app';

describe('Order routes (CRUD)', () => {
  let productId;
  let userToken;
  let adminToken;
  let orderId;

  beforeAll(async () => {
    const adminEmail = `admin${Date.now()}@test.com`;
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({ email: adminEmail, password: 'adminpass', isAdmin: true });
    adminToken = adminRes.body.token;
    const productRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Produit Commande', description: 'desc', price: 10, stock: 5 });
    productId = productRes.body.id;
    const email = `orderuser${Date.now()}@test.com`;
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({ email, password: 'password123' });
    userToken = userRes.body.token;
  });

  it('should create a new order', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ items: [{ productId, quantity: 2 }] });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    orderId = res.body.id;
  });

  it('should get all orders (admin only)', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get order by id (user)', async () => {
    const res = await request(app)
      .get(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
