const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    const hash = await bcrypt.hash('Partner2024!', 10);
    const partner = await prisma.user.upsert({
        where: { email: 'partenaire.test@obem.studio' },
        update: { commissionRate: 10, role: 'PARTNER' },
        create: {
            email: 'partenaire.test@obem.studio',
            name: 'Thomas Renard',
            firstName: 'Thomas',
            lastName: 'Renard',
            role: 'PARTNER',
            password: hash,
            phone: '+33 6 12 34 56 78',
            companyName: 'Renard Consulting',
            commissionRate: 10,
            status: 'Active'
        }
    });
    console.log('✅ Partner créé:', partner.id);
    console.log('   Email:', partner.email);
    console.log('   Mot de passe: Partner2024!');
    console.log('   Commission:', partner.commissionRate + '%');

    // Create a sample commission for demo
    const projects = await prisma.project.findMany({ take: 1 });
    if (projects.length > 0) {
        const proj = projects[0];
        const baseAmount = proj.amount || 5000;
        const rate = 10;
        const commission = await prisma.partnerCommission.create({
            data: {
                partnerId: partner.id,
                projectId: proj.id,
                label: `Commission - ${proj.name}`,
                commissionRate: rate,
                baseAmount: baseAmount,
                commissionAmount: (baseAmount * rate) / 100,
                status: 'PENDING',
            }
        });
        console.log('✅ Commission de démo créée:', commission.id, '→', commission.commissionAmount + '€');
    } else {
        // Create a standalone commission demo
        const commission = await prisma.partnerCommission.create({
            data: {
                partnerId: partner.id,
                label: 'Commission - Site vitrine client demo',
                commissionRate: 10,
                baseAmount: 3500,
                commissionAmount: 350,
                status: 'PAID',
                paidAt: new Date('2025-12-15'),
            }
        });
        const commission2 = await prisma.partnerCommission.create({
            data: {
                partnerId: partner.id,
                label: 'Commission - Refonte e-commerce',
                commissionRate: 10,
                baseAmount: 8000,
                commissionAmount: 800,
                status: 'IN_PROGRESS',
            }
        });
        const commission3 = await prisma.partnerCommission.create({
            data: {
                partnerId: partner.id,
                label: 'Commission - Application mobile',
                commissionRate: 10,
                baseAmount: 12000,
                commissionAmount: 1200,
                status: 'PENDING',
            }
        });
        console.log('✅ 3 commissions de démo créées');
    }

    await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
