const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  // Super Admin 1: Diego Demazure
  const diego = await prisma.user.upsert({
    where: { email: 'diegodemazure1@gmail.com' },
    update: {
      password: passwordHash,
      role: 'SUPER_ADMIN',
      name: 'Diego Demazure'
    },
    create: {
      email: 'diegodemazure1@gmail.com',
      name: 'Diego Demazure',
      password: passwordHash,
      role: 'SUPER_ADMIN',
      theme: 'light',
      status: 'Active'
    },
  });

  // Super Admin 2: Ismaël Abbach
  const ismael = await prisma.user.upsert({
    where: { email: 'isma2bach@gmail.com' },
    update: {
      password: passwordHash,
      role: 'SUPER_ADMIN',
      name: 'Ismaël Abbach'
    },
    create: {
      email: 'isma2bach@gmail.com',
      name: 'Ismaël Abbach',
      password: passwordHash,
      role: 'SUPER_ADMIN',
      theme: 'light',
      status: 'Active'
    },
  });

  // Client Demo
  const client = await prisma.user.upsert({
    where: { email: 'diegodemazure3@gmail.com' },
    update: {
      password: passwordHash,
      role: 'CLIENT',
      name: 'Client Demo'
    },
    create: {
      email: 'diegodemazure3@gmail.com',
      name: 'Client Demo',
      password: passwordHash,
      role: 'CLIENT',
      theme: 'light',
      status: 'Active'
    },
  });

  console.log('Database seeded with production users:');
  console.log('Admin 1:', diego.email);
  console.log('Admin 2:', ismael.email);
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
