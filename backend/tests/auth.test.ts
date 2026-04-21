import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp } from './testApp.js';
import { prisma } from '../src/services/userService.js';
import bcrypt from 'bcrypt';

const app = createTestApp();

// ============================================================
// Test Data
// ============================================================
const testUser = {
  username: `testuser_${Date.now()}`,
  email: `test_${Date.now()}@example.com`,
  password: 'TestPassword123!',
  name: 'Test User',
};

let accessToken: string;
let refreshToken: string;
let userId: string;

// ============================================================
// Setup before each test
// ============================================================
beforeEach(async () => {
  // Create unique user for each test
  const uniqueEmail = `test_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@example.com`;
  const uniqueUsername = `testuser_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const passwordHash = await bcrypt.hash(testUser.password, 12);
  const user = await prisma.user.create({
    data: {
      username: uniqueUsername,
      email: uniqueEmail,
      passwordHash,
      name: testUser.name,
      isEmailVerified: true,
    },
  });
  userId = user.id;
  testUser.email = uniqueEmail;
  testUser.username = uniqueUsername;

  // Login to get tokens
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: uniqueEmail, password: testUser.password });

  // Handle login failures gracefully
  if (loginRes.status !== 200) {
    console.error('Login failed in beforeEach:', loginRes.body);
    throw new Error(`Setup failed: could not login test user`);
  }

  accessToken = loginRes.body.data.accessToken;
  refreshToken = loginRes.body.data.refreshToken;
});

// ============================================================
// Tests
// ============================================================
describe('Auth API', () => {
  // -----------------------------------------------------------
  // REGISTER
  // -----------------------------------------------------------
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'NewPassword123!',
        name: 'New User',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data.user.username).toBe('newuser');
      expect(res.body.data.user.email).toBe('newuser@example.com');
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
    });

    it('should reject duplicate email', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'anotheruser',
        email: testUser.email,
        password: 'AnotherPassword123!',
        name: 'Another User',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('email');
    });

    it('should reject duplicate username', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: testUser.username,
        email: 'different@example.com',
        password: 'DifferentPassword123!',
        name: 'Different User',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      // Error might say "username" or "Validation error" depending on Prisma
      const errorMsg = res.body.error?.toLowerCase() || '';
      expect(errorMsg).toMatch(/username|validation/i);
    });

    it('should reject weak password', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'weakuser',
        email: 'weak@example.com',
        password: '123',
        name: 'Weak User',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject invalid email', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'invalidemail',
        email: 'not-an-email',
        password: 'ValidPassword123!',
        name: 'Invalid Email',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject username with special characters', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'user@name!',
        email: 'special@example.com',
        password: 'ValidPassword123!',
        name: 'Special User',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // -----------------------------------------------------------
  // LOGIN
  // -----------------------------------------------------------
  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
    expect(res.body.data.user).toHaveProperty('id');
    expect(res.body.data.user.email).toBe(testUser.email);
  }, 60000);

    it('should reject wrong password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: 'WrongPassword123!',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Credenciales');
    });

    it('should reject non-existent user', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'SomePassword123!',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject missing email', async () => {
      const res = await request(app).post('/api/auth/login').send({
        password: testUser.password,
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject missing password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: testUser.email,
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // -----------------------------------------------------------
  // REFRESH TOKEN
  // -----------------------------------------------------------
  describe('POST /api/auth/refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      const res = await request(app).post('/api/auth/refresh').send({
        refreshToken,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
    });

    it('should reject invalid refresh token', async () => {
      const res = await request(app).post('/api/auth/refresh').send({
        refreshToken: 'invalid-token',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject missing refresh token', async () => {
      const res = await request(app).post('/api/auth/refresh').send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // -----------------------------------------------------------
  // LOGOUT
  // -----------------------------------------------------------
  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const res = await request(app).post('/api/auth/logout').send({
        refreshToken,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should invalidate the refresh token after logout', async () => {
      // Logout first
      await request(app).post('/api/auth/logout').send({
        refreshToken,
      });

      // Try to use the invalidated refresh token
      const res = await request(app).post('/api/auth/refresh').send({
        refreshToken,
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // -----------------------------------------------------------
  // GET ME (Protected Route)
  // -----------------------------------------------------------
  describe('GET /api/auth/me', () => {
    it('should return current user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.email).toBe(testUser.email);
      expect(res.body.data.username).toBe(testUser.username);
      expect(res.body.data).not.toHaveProperty('passwordHash');
    });

    it('should reject request without token', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject request with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token-here');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // -----------------------------------------------------------
  // CHANGE PASSWORD
  // -----------------------------------------------------------
  describe('POST /api/auth/change-password', () => {
    it('should change password successfully', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: testUser.password,
          newPassword: 'NewSecurePassword456!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify new password works
      const loginRes = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: 'NewSecurePassword456!',
      });

      expect(loginRes.status).toBe(200);
    });

    it('should reject wrong current password', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'WrongPassword123!',
          newPassword: 'NewSecurePassword456!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Contraseña');
    });

    it('should reject weak new password', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: testUser.password,
          newPassword: '123',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
