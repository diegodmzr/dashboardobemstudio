const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addColumn() {
    try {
        // Try to add the column using raw SQL
        await prisma.$executeRawUnsafe(
            'ALTER TABLE Project ADD COLUMN progressConfig TEXT;'
        );
        console.log('✅ Column progressConfig added successfully!');
    } catch (error) {
        if (error.message.includes('duplicate column name')) {
            console.log('✅ Column progressConfig already exists!');
        } else {
            console.error('❌ Error:', error.message);
        }
    } finally {
        await prisma.$disconnect();
    }
}

addColumn();
