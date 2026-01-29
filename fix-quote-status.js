const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Find the most recent draft quote
    const draftQuote = await prisma.quote.findFirst({
        where: { status: 'DRAFT' },
        orderBy: { createdAt: 'desc' }
    });

    if (draftQuote) {
        console.log(`Found draft quote: ${draftQuote.reference} (${draftQuote.id})`);

        // Update to SENT
        const updated = await prisma.quote.update({
            where: { id: draftQuote.id },
            data: { status: 'SENT' }
        });
        console.log(`Updated quote ${updated.reference} to status: ${updated.status}`);
    } else {
        console.log("No draft quotes found.");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
