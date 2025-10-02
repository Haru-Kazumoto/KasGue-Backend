import { PrismaClient } from "@prisma/client";
import * as paymentRepository from "../repositories/payments.repository.js";

const prisma = new PrismaClient();

export async function getAllPayments(from_username,type, from_month, to_month) {
    return paymentRepository.getAll(from_username, type, from_month, to_month);
}

export async function getDetailPayment(payment_id) {
    return paymentRepository.getOne(payment_id);
}

export async function createManyPayments(params) {
    return await prisma.$transaction(async (tx) => {
        return paymentRepository.createBulk(params);
    });
}

export async function createOnePayment(param) {
    return await prisma.$transaction(async (tx) => {
        // const user = await tx.user.findFirst({where: {id: param.user_id}});

        // const get_current_balance = await sumTotalIncome(user.username);
        // const current_balance = get_current_balance[0].total;

        // if(param.type === 'OUTCOME') {
            
        //     const check_balance = await checkCurrentBalance(current_balance, param.amount);

        //     if(!check_balance) {
        //         return null;
        //     }
        // }

        return paymentRepository.createOne(param);
    });
}

async function checkCurrentBalance(curr_balance, outcoming_balance) {
    if(outcoming_balance < curr_balance) {
        return false;
    }

    return true;
}

export async function updatePayment(payment_id, param) {
    return await prisma.$transaction(async () => {
        return paymentRepository.update(payment_id, param);
    });
}

export async function deletePayment(payment_id) {
    return await prisma.payments.delete({
        where: { id: payment_id }
    });
}

export async function sumTotalIncome(username) {
    return paymentRepository.sumTotalIncome(username);
}