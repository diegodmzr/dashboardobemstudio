const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Checking notifications...");
    const notifs = await prisma.notification.findMany({
        where: {
            title: "Devis signé !",
            createdAt: { gt: new Date(Date.now() - 1000 * 60 * 10) } // Last 10 mins
        },
        include: { user: true }
    });

    console.log(`Found ${notifs.length} recent notifications.`);
    notifs.forEach(n => {
        console.log(`- To: ${n.user.email} (${n.userId}) | Msg: ${n.message}`);
    });

    console.log("\nChecking Admin users...");
    const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
    admins.forEach(a => {
        console.log(`- Admin: ${a.email} (${a.id}) Role: ${a.role}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
