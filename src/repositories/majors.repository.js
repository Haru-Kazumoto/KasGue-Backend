import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();

export async function getMajorFromCode(code) {
    const data = await prisma.major.findUnique({
        where: { code }
    });
    if(!data) return null;

    return data;
}

export async function getMajorFromId(id) {
    const data = await prisma.major.findUnique({
        where: { id }
    });
    if(!data) return null;

    return data;
}