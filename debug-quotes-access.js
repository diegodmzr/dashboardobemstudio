const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Fetching all quotes (not draft)...");
    const quotes = await prisma.quote.findMany({
        where: {
            status: { notIn: ["DRAFT", "draft"] }
        },
        include: { client: true }
    });

    console.log(`Found ${quotes.length} visible quotes.`);
    for (const q of quotes) {
        console.log(`- Quote ${q.reference} (ID: ${q.id})`);
        console.log(`  Status: ${q.status}`);
        console.log(`  Client: ${q.client.email} (ID: ${q.clientId})`);
        console.log('---');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
