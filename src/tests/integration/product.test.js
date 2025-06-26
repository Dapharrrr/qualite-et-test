import request from 'supertest';
import app from '../../app';

describe('Product routes (CRUD)', () => {
  let adminToken;
  let productId;
  const productData = {
    name: 'Produit Test',
    description: 'Description test',
    price: 99.99,
    stock: 10
  };

  beforeAll(async () => {
    const email = `admin${Date.now()}@test.com`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email, password: 'adminpass', isAdmin: true });
    adminToken = res.body.token;
  });

  it('should create a new product', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(productData);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    productId = res.body.id;
  });

  it('should get all products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get a product by id', async () => {
    const res = await request(app).get(`/api/products/${productId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', productId);
  });

  it('should update a product', async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...productData, name: 'Produit Modifié' });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Produit Modifié');
  });

  it('should delete a product', async () => {
    const res = await request(app)
      .delete(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', productId);
  });
});
