import './setup';
import request from 'supertest';
import { createApp } from '../app';
import { prisma } from '../db/prismaClient';
import { exchangeCodeForTokens, getUserInfoFromToken } from '../utils/cognito-auth';
import { createTestUser, generateAuthToken } from './helpers';

const app = createApp();

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockedExchangeCodeForTokens = exchangeCodeForTokens as jest.MockedFunction<typeof exchangeCodeForTokens>;
const mockedGetUserInfoFromToken = getUserInfoFromToken as jest.MockedFunction<typeof getUserInfoFromToken>;

describe('Auth Routes', () => {
  describe('POST /api/auth/cognito', () => {
    it('should authenticate existing user with Cognito', async () => {
      const testUser = createTestUser();
      
      mockedExchangeCodeForTokens.mockResolvedValue({
        access_token: 'mock-access-token',
        id_token: 'mock-id-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
      });

      mockedGetUserInfoFromToken.mockResolvedValue({
        email: testUser.email,
        name: testUser.full_name,
        sub: testUser.cognitoSub!,
        email_verified: true,
      });

      mockPrisma.user.findUnique.mockResolvedValue(testUser);

      const response = await request(app)
        .post('/api/auth/cognito')
        .send({ code: 'test-auth-code' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.isNewUser).toBe(false);
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.token).toBeDefined();
    });

    it('should create new user with Cognito and return temp token', async () => {
      mockedExchangeCodeForTokens.mockResolvedValue({
        access_token: 'mock-access-token',
        id_token: 'mock-id-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
      });

      mockedGetUserInfoFromToken.mockResolvedValue({
        email: 'newuser@thapar.edu',
        name: 'New User',
        sub: 'new-cognito-sub',
        email_verified: true,
      });

      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'new-user-id',
        email: 'newuser@thapar.edu',
        full_name: 'New User',
        phone_number: null,
        gender: null,
        date_joined: new Date(),
        cognitoSub: 'new-cognito-sub',
      });

      const response = await request(app)
        .post('/api/auth/cognito')
        .send({ code: 'test-auth-code' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.isNewUser).toBe(true);
      expect(response.body.tempToken).toBeDefined();
      expect(mockPrisma.user.create).toHaveBeenCalled();
    });

    it('should reject non-thapar.edu email', async () => {
      mockedExchangeCodeForTokens.mockResolvedValue({
        access_token: 'mock-access-token',
        id_token: 'mock-id-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
      });

      mockedGetUserInfoFromToken.mockResolvedValue({
        email: 'user@gmail.com',
        name: 'External User',
        sub: 'external-sub',
        email_verified: true,
      });

      const response = await request(app)
        .post('/api/auth/cognito')
        .send({ code: 'test-auth-code' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('thapar.edu');
    });

    it('should return error when authorization code is missing', async () => {
      const response = await request(app)
        .post('/api/auth/cognito')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Authorization code is required');
    });
  });

  describe('POST /api/auth/complete-onboarding', () => {
    it('should complete onboarding for new user with temp token', async () => {
      const tempToken = generateAuthToken('new-user-id', 'newuser@thapar.edu', true);
      const existingUser = createTestUser({
        id: 'new-user-id',
        email: 'newuser@thapar.edu',
        phone_number: null,
        gender: null,
      });

      mockPrisma.user.findUnique.mockResolvedValue(existingUser);
      mockPrisma.user.update.mockResolvedValue({
        ...existingUser,
        phone_number: '9876543210',
        gender: 'Male',
      });

      const response = await request(app)
        .post('/api/auth/complete-onboarding')
        .set('Authorization', `Bearer ${tempToken}`)
        .send({
          phone_number: '9876543210',
          gender: 'Male',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.phone_number).toBe('9876543210');
    });

    it('should reject invalid phone number format', async () => {
      const tempToken = generateAuthToken('new-user-id', 'newuser@thapar.edu', true);
      const existingUser = createTestUser({
        id: 'new-user-id',
        phone_number: null,
        gender: null,
      });

      mockPrisma.user.findUnique.mockResolvedValue(existingUser);

      const response = await request(app)
        .post('/api/auth/complete-onboarding')
        .set('Authorization', `Bearer ${tempToken}`)
        .send({
          phone_number: '123',
          gender: 'Male',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('phone number');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/auth/complete-onboarding')
        .send({
          phone_number: '9876543210',
          gender: 'Male',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user info', async () => {
      const token = generateAuthToken();
      const testUser = createTestUser();

      mockPrisma.user.findUnique.mockResolvedValue(testUser);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('should reject request without token', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject temp token', async () => {
      const tempToken = generateAuthToken('user-id', 'user@thapar.edu', true);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${tempToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('onboarding');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout user successfully', async () => {
      const token = generateAuthToken();

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Logged out');
    });

    it('should require authentication', async () => {
      const response = await request(app).post('/api/auth/logout');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
