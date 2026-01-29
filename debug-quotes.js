const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const quotes = await prisma.quote.findMany({
        include: { client: true, project: true }
    });

    console.log("Quotes found:", quotes.length);
    quotes.forEach(q => {
        console.log(`Quote ${q.id} (Ref: ${q.reference})`);
        console.log(` - Client: ${q.clientId} (${q.client ? q.client.email : 'None'})`);
        console.log(` - Status: ${q.status}`);
        console.log(` - Project: ${q.projectId} (${q.project ? q.project.name : 'None'})`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
