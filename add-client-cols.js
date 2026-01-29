const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addColumns() {
    const columns = [
        { name: 'password', type: 'TEXT' },
        { name: 'phone', type: 'TEXT' },
        { name: 'companyName', type: 'TEXT' },
        { name: 'companyLogo', type: 'TEXT' },
        { name: 'sector', type: 'TEXT' },
        { name: 'status', type: "TEXT DEFAULT 'Active'" },
        { name: 'updatedAt', type: "DATETIME DEFAULT CURRENT_TIMESTAMP" },
    ];

    for (const col of columns) {
        try {
            await prisma.$executeRawUnsafe(
                `ALTER TABLE User ADD COLUMN ${col.name} ${col.type};`
            );
            console.log(`✅ Column ${col.name} added successfully!`);
        } catch (error) {
            if (error.message.includes('duplicate column name')) {
                console.log(`ℹ️ Column ${col.name} already exists.`);
            } else {
                console.error(`❌ Error adding ${col.name}:`, error.message);
            }
        }
    }

    await prisma.$disconnect();
}

addColumns();
