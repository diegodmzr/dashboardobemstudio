const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const passwordHash = await bcrypt.hash('password123', 10);
    const emailsToKeep = [
        'diegodemazure1@gmail.com',
        'isma2bach@gmail.com',
        'diegodemazure3@gmail.com'
    ];

    console.log('--- User Management Script ---');

    // 1. Create or Update the 3 mandatory users
    console.log('Creating/Updating mandatory users...');

    // Diego Demazure - SUPER_ADMIN
    await prisma.user.upsert({
        where: { email: 'diegodemazure1@gmail.com' },
        update: { role: 'SUPER_ADMIN', name: 'Diego Demazure' },
        create: {
            email: 'diegodemazure1@gmail.com',
            name: 'Diego Demazure',
            role: 'SUPER_ADMIN',
            password: passwordHash,
            status: 'Active'
        }
    });

    // Ismaël Abbach - SUPER_ADMIN
    await prisma.user.upsert({
        where: { email: 'isma2bach@gmail.com' },
        update: { role: 'SUPER_ADMIN', name: 'Ismaël Abbach' },
        create: {
            email: 'isma2bach@gmail.com',
            name: 'Ismaël Abbach',
            role: 'SUPER_ADMIN',
            password: passwordHash,
            status: 'Active'
        }
    });

    // Client Demo - CLIENT
    await prisma.user.upsert({
        where: { email: 'diegodemazure3@gmail.com' },
        update: { role: 'CLIENT', name: 'Client Demo' },
        create: {
            email: 'diegodemazure3@gmail.com',
            name: 'Client Demo',
            role: 'CLIENT',
            password: passwordHash,
            status: 'Active'
        }
    });

    console.log('Mandatory users ready.');

    // 2. Delete all other users and their related data
    // To safely delete users, we should clear related data because of foreign key constraints
    console.log('Cleaning up other users...');

    const otherUsers = await prisma.user.findMany({
        where: {
            email: { notIn: emailsToKeep }
        },
        select: { id: true, email: true }
    });

    console.log(`Found ${otherUsers.length} users to delete.`);

    for (const user of otherUsers) {
        console.log(`Deleting user and data for: ${user.email}`);

        // Manual cleanup of relations that might not cascade
        try {
            // Delete projects (and their history/payments/quotes)
            await prisma.projectStatusHistory.deleteMany({ where: { project: { clientId: user.id } } });
            await prisma.payment.deleteMany({ where: { clientId: user.id } });
            await prisma.quote.deleteMany({ where: { clientId: user.id } });
            await prisma.project.deleteMany({ where: { clientId: user.id } });

            // Delete messages/participants for discussions
            await prisma.participant.deleteMany({ where: { userId: user.id } });
            await prisma.message.deleteMany({ where: { senderId: user.id } });

            // Delete audit logs, notifications, tickets, subscriptions
            await prisma.auditLog.deleteMany({ where: { userId: user.id } });
            await prisma.notification.deleteMany({ where: { userId: user.id } });
            await prisma.ticket.deleteMany({ where: { authorId: user.id } });
            await prisma.subscription.deleteMany({ where: { clientId: user.id } });
            await prisma.goal.deleteMany({ where: { userId: user.id } });
            await prisma.formSubmission.deleteMany({ where: { userId: user.id } });

            // Finally delete the user
            await prisma.user.delete({ where: { id: user.id } });
        } catch (error) {
            console.error(`Failed to delete user ${user.email}:`, error.message);
        }
    }

    console.log('Cleanup finished.');
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
