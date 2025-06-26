import { createProduct, findAllProducts, findProductById, updateProductById, deleteProductById } from '../../models/productModel.js';
import { pool } from '../../config/database.js';

import { jest } from '@jest/globals';

describe('Product Model', () => {
  let productMock;
  const originalConnect = pool.connect;

  beforeAll(() => {
    pool.connect = jest.fn();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    productMock = {
      query: jest.fn(),
      release: jest.fn()
    };
    pool.connect.mockResolvedValue(productMock);
  });

  afterAll(() => {
    pool.connect = originalConnect;
  });

  describe('createProduct', () => {
    it('should create a new product', async () => {
      const newProduct = { id: 1, name: 'Test', description: 'desc', price: 10, stock: 5 };
      productMock.query.mockResolvedValue({ rows: [newProduct] });
      const result = await createProduct('Test', 'desc', 10, 5);
      expect(productMock.query).toHaveBeenCalledWith(
        'INSERT INTO products (name, description, price, stock) VALUES ($1, $2, $3, $4) RETURNING *',
        ['Test', 'desc', 10, 5]
      );
      expect(result).toEqual(newProduct);
    });
  });

  describe('findAllProducts', () => {
    it('should return all products', async () => {
      const products = [{ id: 1 }, { id: 2 }];
      productMock.query.mockResolvedValue({ rows: products });
      const result = await findAllProducts();
      expect(productMock.query).toHaveBeenCalledWith('SELECT * FROM products');
      expect(result).toEqual(products);
    });
  });

  describe('findProductById', () => {
    it('should return a product by id', async () => {
      const product = { id: 1, name: 'Test' };
      productMock.query.mockResolvedValue({ rows: [product] });
      const result = await findProductById(1);
      expect(productMock.query).toHaveBeenCalledWith('SELECT * FROM products WHERE id = $1', [1]);
      expect(result).toEqual(product);
    });
  });

  describe('updateProductById', () => {
    it('should update a product and return updated product', async () => {
      const updated = { id: 1, name: 'Updated', description: 'desc', price: 20, stock: 10 };
      productMock.query.mockResolvedValue({ rows: [updated] });
      const result = await updateProductById(1, 'Updated', 'desc', 20, 10);
      expect(productMock.query).toHaveBeenCalledWith(
        'UPDATE products SET name = $1, description = $2, price = $3, stock = $4 WHERE id = $5 RETURNING *',
        ['Updated', 'desc', 20, 10, 1]
      );
      expect(result).toEqual(updated);
    });
  });

  describe('deleteProductById', () => {
    it('should delete a product and return deleted product', async () => {
      const deleted = { id: 1, name: 'Deleted' };
      productMock.query.mockResolvedValue({ rows: [deleted] });
      const result = await deleteProductById(1);
      expect(productMock.query).toHaveBeenCalledWith('DELETE FROM products WHERE id = $1 RETURNING *', [1]);
      expect(result).toEqual(deleted);
    });
  });
});
