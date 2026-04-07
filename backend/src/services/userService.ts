import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const userService = {
  async create(data: { email: string; password: string; name: string }) {
    const passwordHash = await bcrypt.hash(data.password, 12);
    
    return prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        name: data.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isPremium: true,
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

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isPremium: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
  },

  async update(id: string, data: { name?: string; avatarUrl?: string }) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isPremium: true,
        avatarUrl: true,
        createdAt: true,
      },
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
};

export { prisma };
