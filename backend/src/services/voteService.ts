import { prisma } from './userService.js';
import { deleteCache } from './cacheService.js';

export const voteService = {
  async vote(userId: string, cvId: string) {
    const existingVote = await prisma.vote.findUnique({
      where: { userId_cvId: { userId, cvId } },
    });

    if (existingVote) {
      throw new Error('Ya votaste este CV');
    }

    await prisma.$transaction([
      prisma.vote.create({
        data: { userId, cvId },
      }),
      prisma.cV.update({
        where: { id: cvId },
        data: { upvotes: { increment: 1 } },
      }),
    ]);

    // Invalidate top CVs cache when voting changes order
    await deleteCache('top-cvs:*');

    return { voted: true };
  },

  async unvote(userId: string, cvId: string) {
    const existingVote = await prisma.vote.findUnique({
      where: { userId_cvId: { userId, cvId } },
    });

    if (!existingVote) {
      throw new Error('No has votado este CV');
    }

    await prisma.$transaction([
      prisma.vote.delete({
        where: { id: existingVote.id },
      }),
      prisma.cV.update({
        where: { id: cvId },
        data: { upvotes: { decrement: 1 } },
      }),
    ]);

    // Invalidate top CVs cache when voting changes order
    await deleteCache('top-cvs:*');

    return { voted: false };
  },

  async hasVoted(userId: string, cvId: string) {
    const vote = await prisma.vote.findUnique({
      where: { userId_cvId: { userId, cvId } },
    });
    return !!vote;
  },

  async getUserVotes(userId: string, cvIds: string[]) {
    const votes = await prisma.vote.findMany({
      where: { userId, cvId: { in: cvIds } },
      select: { cvId: true },
    });
    return votes.map((v) => v.cvId);
  },
};
