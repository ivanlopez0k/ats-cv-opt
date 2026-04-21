import { prisma } from '../src/services/userService.js';
import { config } from '../src/config/index.js';

// ============================================================
// Global Setup: Run before all tests
// ============================================================

// Ensure we're using a test database (or at least warn)
const dbUrl = config.database?.url || process.env.DATABASE_URL || '';
if (!dbUrl.includes('test') && config.nodeEnv !== 'test') {
  console.warn('⚠️  WARNING: Running tests against non-test database!');
  console.warn(`   Database URL: ${dbUrl}`);
}

// ============================================================
// Before All Tests: Clean database once
// ============================================================
beforeAll(async () => {
  await cleanupDatabase();
});

// ============================================================
// After All Tests: Disconnect Prisma
// ============================================================
afterAll(async () => {
  await prisma.$disconnect();
});

// ============================================================
// Helper: Clean database tables
// ============================================================
async function cleanupDatabase() {
  try {
    // Delete in reverse order of dependencies
    await prisma.auditLog.deleteMany();
    await prisma.vote.deleteMany();
    await prisma.session.deleteMany();
    await prisma.cV.deleteMany();
    await prisma.user.deleteMany();
  } catch (error) {
    console.error('Database cleanup failed:', error);
  }
}

// ============================================================
// Test Helpers
// ============================================================

/**
 * Create a test user
 */
export async function createTestUser(overrides = {}) {
  const userData = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'TestPassword123!',
    name: 'Test User',
    nationality: 'Argentina',
    ...overrides,
  };

  const registerResponse = await fetch(`${config.frontend.url || 'http://localhost:3000'}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: userData.username,
      email: userData.email,
      password: userData.password,
      name: userData.name,
    }),
  });

  // Use prisma directly since we're testing the service layer
  return prisma.user.create({
    data: {
      username: userData.username.toLowerCase(),
      email: userData.email.toLowerCase(),
      passwordHash: await require('bcrypt').hash(userData.password, 12),
      name: userData.name,
      isEmailVerified: true,
    },
  });
}

/**
 * Login and get auth tokens
 */
export async function getAuthTokens(user: { email: string; password: string }) {
  const response = await fetch(`http://localhost:${config.port}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: user.email,
      password: user.password,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Login failed');
  }

  return {
    accessToken: data.data.accessToken,
    refreshToken: data.data.refreshToken,
    user: data.data.user,
  };
}
