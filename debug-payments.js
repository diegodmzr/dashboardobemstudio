const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Checking recent payments...");
    const payments = await prisma.payment.findMany({
        where: { createdAt: { gt: new Date(Date.now() - 1000 * 60 * 60) } }, // Last hour
        orderBy: { createdAt: "desc" }
    });

    console.log(`Found ${payments.length} recent payments.`);
    payments.forEach(p => {
        console.log(`- ID: ${p.id}`);
        console.log(`  Amount: ${p.amount} ${p.currency}`);
        console.log(`  Status: ${p.status}`);
        console.log(`  PaidAt: ${p.paidAt}`);
        console.log(`  CreatedAt: ${p.createdAt}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
