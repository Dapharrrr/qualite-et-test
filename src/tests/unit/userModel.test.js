import { createUser, findUserByEmail, findUserById, deleteUser, updateUser, loginUser } from '../../models/userModel.js';
import { pool } from '../../config/database.js';
import bcrypt from 'bcryptjs';
import { jest } from '@jest/globals';

describe('User Model', () => {
    let userMock;

    const originalConnect = pool.connect;

    beforeAll(() => {
      pool.connect = jest.fn();
    });

    beforeEach(() => {
      jest.clearAllMocks();
      userMock = {
          query: jest.fn(),
          release: jest.fn()
      }
      pool.connect.mockResolvedValue(userMock);
    });

    afterAll(() => {
      pool.connect = originalConnect;
    });

    describe('createUser', () => {
      it('should create a new user with hashed password', async () => {
        jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword123'); 
        userMock.query.mockResolvedValue({
        rows: [{
            id: 1,
            email: 'test@test.com',
            is_admin: false,
            created_at: new Date(),
          }]
        });
        const user = await createUser('test@test.com', 'password123', false);

        expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);

        expect(userMock.query).toHaveBeenCalledWith(
          'INSERT INTO users (email, password, is_admin) VALUES ($1, $2, $3) RETURNING id, email, is_admin, created_at',
          ['test@test.com', 'hashedPassword123', false]
        );

        expect(userMock.release).toHaveBeenCalled();

        expect(user).toEqual({
          id: 1,
          email: 'test@test.com',
          is_admin: false,
          created_at: expect.any(Date),
          role: 'user'
        });
      })
    })

    describe('finduserByEmail', () => {
      it('should find a user by email', async () => {
        userMock.query.mockResolvedValue({
          rows: [{
            id: 1,
            email: 'test@test.com', 
            password: 'hashedPassword123',
            is_admin: false,
            created_at: new Date(),
          }],
        });

        const user = await findUserByEmail('test@test.com');
        expect(userMock.query).toHaveBeenCalledWith(
          'SELECT * FROM users WHERE email = $1',
          ['test@test.com']
        );
        expect(userMock.release).toHaveBeenCalled();
        expect(user).toMatchObject({
            id: 1,
            email: 'test@test.com', 
            password: 'hashedPassword123',
            is_admin: false,
            role: 'user'
        });
      });
    });

    describe('findUserById', () => {
     it('should find a user by ID', async () => {
      userMock.query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          email: 'test@test.com',
          is_admin: false
        }]
      });
      const user = await findUserById(1);
    
      expect(userMock.query).toHaveBeenCalledWith(
        'SELECT id, email, is_admin FROM users WHERE id = $1',
        [1]
      );
      expect(userMock.release).toHaveBeenCalled();
      expect(user).toEqual({
        id: 1,
        email: 'test@test.com',
        is_admin: false,
        role: 'user'
      });
    });
    });

    describe('deleteUser', () => {
      it('should delete a user by id and return true if deleted', async () => {
        userMock.query.mockResolvedValue({ rowCount: 1 });
        const result = await deleteUser(1);
        expect(userMock.query).toHaveBeenCalledWith('DELETE FROM users WHERE id = $1', [1]);
        expect(result).toBe(true);
      });

      it('should return false if no user was deleted', async () => {
        userMock.query.mockResolvedValue({ rowCount: 0 });
        const result = await deleteUser(999);
        expect(result).toBe(false);
      });
    });

    describe('updateUser', () => {
      it('should update user email and return updated user', async () => {
        const updatedUser = { id: 1, email: 'new@test.com', is_admin: false };
        userMock.query.mockResolvedValue({ rows: [updatedUser] });
        const result = await updateUser(1, { email: 'new@test.com' });
        expect(userMock.query).toHaveBeenCalled();
        expect(result).toEqual(updatedUser);
      });
    });

    describe('loginUser', () => {
      it('should return user if email and password are correct', async () => {
        const userFromDb = { id: 1, email: 'test@test.com', password: 'hashed', is_admin: false };
        userMock.query.mockResolvedValue({ rows: [userFromDb] });
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
        const result = await loginUser('test@test.com', 'password123');
        expect(userMock.query).toHaveBeenCalledWith('SELECT * FROM users WHERE email = $1', ['test@test.com']);
        expect(result).toEqual(userFromDb);
      });

      it('should return null if password is incorrect', async () => {
        const userFromDb = { id: 1, email: 'test@test.com', password: 'hashed', is_admin: false };
        userMock.query.mockResolvedValue({ rows: [userFromDb] });
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);
        const result = await loginUser('test@test.com', 'wrongpassword');
        expect(result).toBeNull();
      });

      it('should return null if user does not exist', async () => {
        userMock.query.mockResolvedValue({ rows: [] });
        const result = await loginUser('notfound@test.com', 'password123');
        expect(result).toBeNull();
      });
    });
  });
