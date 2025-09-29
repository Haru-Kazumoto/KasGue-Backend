import { Prisma, PrismaClient } from "@prisma/client";
import { Router } from "express";
import ensureAuthenticated from "../middlewares/ensure-auth.middleware.js";
import passport from "passport";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const router = Router();

router.post("/auth/register",async (req, res, next) => {
    const { username, password, fullname, email, major_id } = req.body || {}; // type save if there is not body retrieved

    if (!username || !password || !fullname || !email || !major_id) {
        return res.status(400).json({
            message: "Field is required, [EMAIL, PASSWORD, USERNAME, FULLNAME]",
            error: "Bad Request",
            code: 401
        });
    }

    try {
        const password_hash = await bcrypt.hash(password, 12);

        const major = await prisma.major.findUnique({
            where: { id: major_id },
            select: { id: true, code: true }
        });

        if (!major) return res.status(404).json({
            message: "Major tidak ditemukan, " + major_id,
            error: "Not Found",
            code: 404
        });

        const user = await prisma.user.create({
            data: {
                username,
                password: password_hash,
                fullname,
                email,
                major: {
                    connect: {
                        id: Number(major.id)
                    }
                }
            }
        });

        return res.status(201).json(user);
    } catch (err) {
        // Unique constraint (email/username)
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
            // meta.target biasanya berisi field mana yang unik
            const target = Array.isArray(err.meta?.target) ? err.meta.target.join(", ") : "unique field";
            return res.status(409).json({
                message: `Duplicate value on ${target}`,
                error: "Conflict",
                code: 409,
            });
        }

        // Record to connect tidak ditemukan (Major id tidak ada)
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
            return res.status(404).json({
                message: `Major with id ${majorIdNum} not found`,
                error: "Not Found",
                code: 404,
            });
        }

        console.error(err);
        return res.status(500).json({
            message: "Internal server error",
            error: "Server Error",
            code: 500,
        });
    }
});

// Login (session dibuat otomatis)
router.post("/auth/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ error: info?.message || "Login gagal" });

        req.logIn(user, (err2) => {
            if (err2) return next(err2);
            // sekarang session terset di store + cookie dikirim
            return res.json({ user });
        });
    })(req, res, next);
});

// Who am I
router.get("/auth/me", ensureAuthenticated, (req, res) => {
    res.json({ user: req.user });
});

// Logout (hapus session)
router.post("/auth/logout", ensureAuthenticated, (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
        req.session.destroy(() => {
            res.clearCookie("sid");
            res.json({ status: true });
        });
    });
});

export default router;