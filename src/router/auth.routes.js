import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import register from "../services/auth.services.js";
import ensureAuthenticated from "../middlewares/ensure-auth.middleware.js";
import passport from "passport";

const prisma = new PrismaClient();
const router = Router();

router.post("/auth/register", register);

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