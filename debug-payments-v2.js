const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const payments = await prisma.payment.findMany({
        where: { createdAt: { gt: new Date(Date.now() - 1000 * 60 * 60 * 24) } } // Last 24h
    });
    console.log(JSON.stringify(payments.map(p => ({
        id: p.id,
        amount: p.amount,
        status: p.status,
        paidAt: p.paidAt,
        createdAt: p.createdAt
    })), null, 2));
}

main().finally(() => prisma.$disconnect());
