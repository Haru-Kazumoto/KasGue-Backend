import { Router } from "express";
import ensureAuthenticated from "../middlewares/ensure-auth.middleware.js";
import * as paymentService from "../services/payments.service.js";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.get('/payments/get-all', async (req, res) => {
    try {
        const {
            username,
            type,
            from_month,
            to_month,
        } = req.query;

        const result = await paymentService.getAllPayments(
            username,
            type,
            from_month ? String(from_month) : undefined,
            to_month ? String(to_month) : undefined
        );

        res.status(200).json({
            message: 'Berhasil mendapatkan data pembayaran',
            data: result.data,
            pagination: result.pagination,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Gagal mengambil data pembayaran' });
    }
});

router.get('/payments/sum-income', async (req, res) => {
    const { username } = req.params;

    const result = await paymentService.sumTotalIncome(username);

    res.status(200).json({
        message: "Berhasil menghitung total pendapatan",
        data: result
    });
})

router.get("payments/:id/detail", ensureAuthenticated, (req, res) => {
    const { id } = req.params;

    try {
        paymentService.getDetailPayment(id);
    } catch (err) {
        res.status(400).json({
            message: "Gagal mengambil data",
            errors: err
        });
    }
});

router.post("/payments/create",async (req, res) => {
    try {
        const user = await prisma.user.findFirst({where: { username: req.body.username }});
        
        await paymentService.createOnePayment({
            amount: req.body.amount,
            method: req.body.method,
            payer_name: req.body.payer_name,
            type: req.body.status,
            payment_segment: req.body.type,
            description: req.body.notes,
            user_id: user.id
        });

        res.status(201).json({
            message: "Berhasil menyimpan data"
        });
    } catch(err) {
        res.status(400).json({
            message: "Gagal menyimpan data",
            errors: err
        });
    }
});

export default router;