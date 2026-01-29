const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const sentQuotes = await prisma.quote.findMany({
        where: {
            status: { notIn: ['DRAFT', 'draft'] }
        }
    });

    console.log("Sent/Signed Quotes:", sentQuotes.length);
    sentQuotes.forEach(q => {
        console.log(`- ${q.reference} [${q.status}] ID: ${q.id} Client: ${q.clientId}`);
    });

    const users = await prisma.user.findMany({ where: { role: 'CLIENT' } });
    console.log("Clients:", users.length);
    users.forEach(u => console.log(`- ${u.name} ID: ${u.id}`));
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
