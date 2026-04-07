import { prisma } from './userService.js';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt.js';
import { config } from '../config/index.js';

export const sessionService = {
  async createSession(user: { id: string; email: string; role: string }) {
    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const refreshPayload = verifyToken(refreshToken);
    const expiresAt = new Date(refreshPayload.exp * 1000);

    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  },

  async refreshSession(refreshToken: string) {
    const session = await prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    });

    if (!session) throw new Error('Sesión no encontrada');
    if (session.expiresAt < new Date()) {
      await prisma.session.delete({ where: { id: session.id } });
      throw new Error('Sesión expirada');
    }

    const payload = {
      userId: session.user.id,
      email: session.user.email,
      role: session.user.role,
    };

    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    const refreshPayload = verifyToken(newRefreshToken);
    const expiresAt = new Date(refreshPayload.exp * 1000);

    await prisma.session.update({
      where: { id: session.id },
      data: { refreshToken: newRefreshToken, expiresAt },
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  },

  async deleteSession(refreshToken: string) {
    return prisma.session.deleteMany({
      where: { refreshToken },
    });
  },

  async deleteAllUserSessions(userId: string) {
    return prisma.session.deleteMany({
      where: { userId },
    });
  },
};
