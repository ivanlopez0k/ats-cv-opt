import { prisma } from './userService.js';
import type { NotificationType } from '@prisma/client';

/**
 * Create a notification for a user
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  data,
}: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
}) {
  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      data: data || undefined,
    },
  });
}

/**
 * Notify when CV processing completes
 */
export async function notifyCVCompleted(cvId: string, userId: string, title: string) {
  return createNotification({
    userId,
    type: 'CV_COMPLETED',
    title: '¡Tu CV está listo!',
    message: `"${title}" ha sido optimizado por la IA. ¡Descargalo ahora!`,
    data: { cvId },
  });
}

/**
 * Notify when CV processing fails
 */
export async function notifyCVFailed(cvId: string, userId: string, title: string, error: string) {
  return createNotification({
    userId,
    type: 'CV_FAILED',
    title: 'Error al procesar tu CV',
    message: `"${title}" no pudo ser procesado: ${error}`,
    data: { cvId },
  });
}

/**
 * Notify when user receives a vote
 */
export async function notifyVoteReceived(cvId: string, userId: string, voterUsername: string) {
  return createNotification({
    userId,
    type: 'VOTE_RECEIVED',
    title: '¡Nuevo voto en tu CV!',
    message: `${voterUsername} votó tu CV. ¡Seguí así!`,
    data: { cvId },
  });
}