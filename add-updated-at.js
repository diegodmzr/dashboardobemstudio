const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addUpdatedAt() {
    try {
        await prisma.$executeRawUnsafe(
            'ALTER TABLE User ADD COLUMN updatedAt DATETIME;'
        );
        console.log('✅ Column updatedAt added successfully!');
    } catch (error) {
        if (error.message.includes('duplicate column name')) {
            console.log('✅ Column updatedAt already exists!');
        } else {
            console.error('❌ Error:', error.message);
        }
    } finally {
        await prisma.$disconnect();
    }
}

addUpdatedAt();
