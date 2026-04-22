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
  /**
   * Find user by ID
   */
  async findById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        avatarUrl: true,
        nationality: true,
        defaultTargetJob: true,
        defaultTargetIndustry: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });
  },

  /**
   * Find user by username
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

  // ============================================================
  // Avatar
  // ============================================================
  async updateAvatar(userId: string, avatarUrl: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: { id: true, username: true, email: true, name: true, avatarUrl: true },
    });
  },

  async removeAvatar(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true },
    });
    if (!user) throw new Error('Usuario no encontrado');

    return prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: null },
      select: { id: true, username: true, email: true, name: true, avatarUrl: true },
    });
  },
};

export { prisma };
