const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@obemstudio.com' },
    update: {
      password: passwordHash,
      role: 'ADMIN',
      // ensure basic info just in case
    },
    create: {
      email: 'admin@obemstudio.com',
      name: 'Diego Demazure',
      firstName: 'Diego',
      lastName: 'Demazure',
      password: passwordHash,
      role: 'ADMIN',
      theme: 'light',
      status: 'Active'
    },
  });

  // Client
  const client = await prisma.user.upsert({
    where: { email: 'client@demo.com' },
    update: {
      password: passwordHash,
      role: 'CLIENT',
    },
    create: {
      email: 'client@demo.com',
      name: 'Client Demo',
      firstName: 'Client',
      lastName: 'Demo',
      password: passwordHash,
      role: 'CLIENT',
      theme: 'light',
      status: 'Active'
    },
  });

  console.log('Database seeded with test users:');
  console.log('Admin:', admin.email);
  console.log('Client:', client.email);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
