import { createOrder, findOrdersByUserId, findAllOrders, findOrderById } from '../../models/orderModel.js';
import { pool } from '../../config/database.js';
import { jest } from '@jest/globals';

describe('Order Model', () => {
  let orderMock;
  const originalConnect = pool.connect;

  beforeAll(() => {
    pool.connect = jest.fn();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    orderMock = {
      query: jest.fn(),
      release: jest.fn()
    };
    pool.connect.mockResolvedValue(orderMock);
  });

  afterAll(() => {
    pool.connect = originalConnect;
  });

  describe('createOrder', () => {
    it('should create a new order and return it', async () => {
      orderMock.query
        .mockResolvedValueOnce({}) 
        .mockResolvedValueOnce({ rows: [{ price: 10 }] }) 
        .mockResolvedValueOnce({ rows: [{ price: 20 }] }) 
        .mockResolvedValueOnce({ rows: [{ id: 1, user_id: 1, total_price: 40 }] }) 
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({}) 
        .mockResolvedValueOnce({}); 
      const items = [ { productId: 1, quantity: 2 }, { productId: 2, quantity: 1 } ];
      const result = await createOrder(1, items);
      expect(orderMock.query).toHaveBeenCalled();
      expect(result).toMatchObject({ id: 1, user_id: 1, total_price: 40 });
    });
  });

  describe('findOrdersByUserId', () => {
    it('should return orders for a user', async () => {
      const orders = [{ id: 1, user_id: 1 }];
      orderMock.query.mockResolvedValue({ rows: orders });
      const result = await findOrdersByUserId(1);
      expect(orderMock.query).toHaveBeenCalledWith('SELECT * FROM orders WHERE user_id = $1', [1]);
      expect(result).toEqual(orders);
    });
  });

  describe('findAllOrders', () => {
    it('should return all orders', async () => {
      const orders = [{ id: 1 }, { id: 2 }];
      orderMock.query.mockResolvedValue({ rows: orders });
      const result = await findAllOrders();
      expect(orderMock.query).toHaveBeenCalled();
      expect(result).toEqual(orders);
    });
  });

  describe('findOrderById', () => {
    it('should return order details by id', async () => {
      const details = [{ id: 1, product_name: 'Test', quantity: 2 }];
      orderMock.query.mockResolvedValue({ rows: details });
      const result = await findOrderById(1);
      expect(orderMock.query).toHaveBeenCalled();
      expect(result).toEqual(details);
    });
  });
});
