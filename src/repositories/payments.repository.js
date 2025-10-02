import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAll(from_username, type, from_month, to_month, page = 1, limit = 10) {
    // base filter
    const where = {
        type,
        user: {
            username: from_username,
            deleted_at: null
        }
    };

    if (from_month) {
        where.created_at = {
            ...(where.created_at || {}),
            gte: new Date(`${from_month}-01`)
        };
    }

    if (to_month) {
        where.created_at = {
            ...(where.created_at || {}),
            lte: new Date(`${to_month}-31`)
        };
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
        prisma.payments.findMany({
            orderBy: { created_at: 'asc' },
            where,
            skip,
            take: limit,
        }),
        prisma.payments.count({ where })
    ]);

    return {
        data,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
}

export async function createBulk(params) {
    return await prisma.payments.createManyAndReturn({
        data: params.map((data) => ({
            amount: data.amount,
            method: data.method,
            description: data.description,
            user_id: data.user_id
        }))
    });
}

export async function createOne(param) {
    return await prisma.payments.create({
        data: {
            amount: param.amount,
            method: param.method,
            payer_name: param.payer_name,
            type: param.type,
            payment_segment: param.payment_segment,
            description: param.description,
            user_id: param.user_id
        }
    });
}

export async function update(payment_id, param) {
    return await prisma.payments.update({
        where: { id: payment_id },
        data: {
            ...param
        }
    })
}

export async function deleteOne(payment_id) {
    return await prisma.payments.update({
        where: { id: payment_id },
        data: { deleted_at: new Date() }
    })
}

export async function getOne(payment_id) {
    return await prisma.payments.findFirst({
        where: { id: payment_id }
    });
}

export async function sumTotalIncome(username) {
    const user = await prisma.user.findFirst({
        where: { username },
        select: { id: true },
    });

    if (!user) return 0;

    const result = prisma.$queryRaw`
        SELECT COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount 
                           WHEN type = 'OUTCOME' THEN -amount 
                           ELSE 0 END),0) as total
        FROM payments
        WHERE user_id = ${user.id}
    `;

    return result;
}

