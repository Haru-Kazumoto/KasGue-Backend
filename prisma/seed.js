import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding start...');

    await prisma.major.createMany({
        data: [
            {
                name: "MANAJEMEN INFORMATIKA D3",
                code: "MID3"
            }
        ]
    });

    console.log('✅ Seeding done.');
}

main()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
        console.error('❌ Seeding error:', e)
        await prisma.$disconnect()
        process.exit(1)
    });
