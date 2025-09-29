import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();

export async function createUserConnectMajor(params, major_id) {

    return await prisma.user.create({
        data: {
            username: params.username,
            email: params.email,
            password: params.password,
            fullname: params.fullname,
            major: {
                connect: {
                    id: Number(major_id)
                }
            }
        }
    });
    
}