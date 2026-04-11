import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { config } from '../config/index.js';

const prisma = new PrismaClient();

// ============================================================
// Username validation
// ============================================================
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!USERNAME_REGEX.test(username)) {
    return {
      valid: false,
      error: 'El username debe tener entre 3 y 20 caracteres, solo letras, números y guiones bajos',
    };
  }
  return { valid: true };
}

// ============================================================
// Password strength validation
// ============================================================
const PASSWORD_REGEX = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
  special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
};

export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  if (!config.security.passwordStrengthEnabled) {
    return { valid: true, errors: [] };
  }

  const errors: string[] = [];

  if (password.length < 8) errors.push('La contraseña debe tener al menos 8 caracteres');
  if (!PASSWORD_REGEX.uppercase.test(password)) errors.push('Debe contener al menos una letra mayúscula');
  if (!PASSWORD_REGEX.lowercase.test(password)) errors.push('Debe contener al menos una letra minúscula');
  if (!PASSWORD_REGEX.number.test(password)) errors.push('Debe contener al menos un número');
  if (!PASSWORD_REGEX.special.test(password)) errors.push('Debe contener al menos un carácter especial');

  return { valid: errors.length === 0, errors };
}

// ============================================================
// Common nationalities for the dropdown
// ============================================================
export const COMMON_NATIONALITIES = [
  'Argentina',
  'Bolivia',
  'Brasil',
  'Chile',
  'Colombia',
  'Costa Rica',
  'Cuba',
  'Ecuador',
  'El Salvador',
  'España',
  'Guatemala',
  'Honduras',
  'México',
  'Nicaragua',
  'Panamá',
  'Paraguay',
  'Perú',
  'República Dominicana',
  'Uruguay',
  'Venezuela',
  'Estados Unidos',
  'Otro',
] as const;

// ============================================================
// User service
// ============================================================
export const userService = {
  async create(data: {
    username: string;
    email: string;
    password: string;
    name: string;
    nationality?: string;
    defaultTargetJob?: string;
    defaultTargetIndustry?: string;
  }) {
    // Validate username
    const usernameResult = validateUsername(data.username);
    if (!usernameResult.valid) {
      throw new Error(usernameResult.error);
    }

    // Check username availability
    const existingUsername = await prisma.user.findUnique({
      where: { username: data.username.toLowerCase() },
      select: { id: true },
    });
    if (existingUsername) {
      throw new Error('El username ya está en uso');
    }

    // Validate password strength
    const strengthResult = validatePasswordStrength(data.password);
    if (!strengthResult.valid) {
      throw new Error(strengthResult.errors.join(', '));
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    // Generate email verification token if email verification is enabled
    const emailVerifyToken = config.security.emailVerificationEnabled
      ? crypto.randomBytes(32).toString('hex')
      : null;
    const emailVerifyExpiresAt = config.security.emailVerificationEnabled
      ? new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      : null;

    return prisma.user.create({
      data: {
        username: data.username.toLowerCase(),
        email: data.email.toLowerCase(),
        passwordHash,
        name: data.name,
        nationality: data.nationality || null,
        defaultTargetJob: data.defaultTargetJob || null,
        defaultTargetIndustry: data.defaultTargetIndustry || null,
        isEmailVerified: !config.security.emailVerificationEnabled,
        emailVerifyToken,
        emailVerifyExpiresAt,
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        nationality: true,
        defaultTargetJob: true,
        defaultTargetIndustry: true,
        role: true,
        isPremium: true,
        isEmailVerified: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
  },

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  },

  async findByUsername(username: string) {
    return prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    });
  },

  async isUsernameAvailable(username: string): Promise<boolean> {
    const existing = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      select: { id: true },
    });
    return !existing;
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        nationality: true,
        defaultTargetJob: true,
        defaultTargetIndustry: true,
        role: true,
        isPremium: true,
        isEmailVerified: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
  },

  async update(id: string, data: {
    name?: string;
    avatarUrl?: string;
    nationality?: string;
    defaultTargetJob?: string;
    defaultTargetIndustry?: string;
  }) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        nationality: true,
        defaultTargetJob: true,
        defaultTargetIndustry: true,
        role: true,
        isPremium: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
  },

  async updateUsername(id: string, username: string) {
    const usernameResult = validateUsername(username);
    if (!usernameResult.valid) {
      throw new Error(usernameResult.error);
    }

    const available = await this.isUsernameAvailable(username);
    if (!available) {
      throw new Error('El username ya está en uso');
    }

    return prisma.user.update({
      where: { id },
      data: { username: username.toLowerCase() },
      select: { id: true, username: true, email: true, name: true },
    });
  },

  async updatePassword(id: string, passwordHash: string) {
    return prisma.user.update({
      where: { id },
      data: { passwordHash, failedLoginAttempts: 0, lockedUntil: null },
      select: { id: true, email: true, username: true, name: true },
    });
  },

  async verifyPassword(user: { passwordHash: string }, password: string) {
    return bcrypt.compare(password, user.passwordHash);
  },

  async upgradeToPremium(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { isPremium: true },
    });
  },

  // ============================================================
  // Account lockout
  // ============================================================
  async incrementFailedAttempts(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { failedLoginAttempts: true, email: true },
    });

    const newCount = (user?.failedLoginAttempts || 0) + 1;

    if (config.security.accountLockoutEnabled && newCount >= config.security.accountLockoutMaxAttempts) {
      const lockedUntil = new Date(Date.now() + config.security.accountLockoutDurationMs);
      return prisma.user.update({
        where: { id: userId },
        data: { failedLoginAttempts: newCount, lockedUntil },
      });
    }

    return prisma.user.update({
      where: { id: userId },
      data: { failedLoginAttempts: newCount },
    });
  },

  async resetFailedAttempts(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });
  },

  async isAccountLocked(user: { lockedUntil: Date | null }): Promise<boolean> {
    if (!config.security.accountLockoutEnabled) return false;
    if (!user.lockedUntil) return false;
    if (user.lockedUntil > new Date()) return true;

    // Lock expired — reset
    return false;
  },

  // ============================================================
  // Email verification
  // ============================================================
  async verifyEmail(token: string) {
    if (!config.security.emailVerificationEnabled) return null;

    const user = await prisma.user.findFirst({
      where: {
        emailVerifyToken: token,
        emailVerifyExpiresAt: { gt: new Date() },
      },
    });

    if (!user) return null;

    return prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpiresAt: null,
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        isEmailVerified: true,
      },
    });
  },

  async resendVerificationEmail(userId: string) {
    if (!config.security.emailVerificationEnabled) return null;

    const emailVerifyToken = crypto.randomBytes(32).toString('hex');
    const emailVerifyExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    return prisma.user.update({
      where: { id: userId },
      data: { emailVerifyToken, emailVerifyExpiresAt },
      select: { id: true, email: true, username: true, emailVerifyToken: true },
    });
  },

  /**
   * Check if user needs email verification (only when the feature is enabled).
   */
  async needsEmailVerification(userId: string): Promise<boolean> {
    if (!config.security.emailVerificationEnabled) return false;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isEmailVerified: true },
    });

    return !user?.isEmailVerified;
  },

  // ============================================================
  // Password reset
  // ============================================================
  async createPasswordResetToken(email: string) {
    const user = await this.findByEmail(email);
    if (!user) return null;

    const passwordResetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    return prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken, passwordResetExpiresAt },
      select: { id: true, email: true, username: true, name: true, passwordResetToken: true },
    });
  },

  async resetPassword(token: string, newPassword: string) {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpiresAt: { gt: new Date() },
      },
    });

    if (!user) return null;

    const passwordHash = await bcrypt.hash(newPassword, 12);

    return prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        isEmailVerified: true,
      },
    });
  },
};

export { prisma };
