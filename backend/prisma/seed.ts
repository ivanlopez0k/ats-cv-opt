import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const user = await prisma.user.upsert({
    where: { email: 'demo@cvmaster.com' },
    update: {},
    create: {
      username: 'demo',
      email: 'demo@cvmaster.com',
      passwordHash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.PQjUq.T9QxQq6a',
      name: 'Demo User',
      isPremium: true,
    },
  });

  console.log(`✅ Created user: ${user.email}`);
  console.log('📝 Demo password: demo123456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
