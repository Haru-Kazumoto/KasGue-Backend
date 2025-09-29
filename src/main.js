import express from "express";
import helmet from "helmet";
import session from "express-session";
import passport from "passport";
import bcrypt from "bcrypt";
import cors from "cors";
import pkg from "pg";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { PrismaClient } from "@prisma/client";
import { configurePassport } from "./passport.js";
import ensureAuthenticated from "./middlewares/ensure-auth.middleware.js";
import authRoutes from "./router/auth.routes.js";
const { Pool } = pkg;

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
})

app.use(express.json());
app.use(helmet(
    {
        crossOriginResourcePolicy: false,
        contentSecurityPolicy: false
    }
));
app.use(cors({
    origin: ["https://haru-kazumoto.github.io/KasGue/", "http://localhost:5500", "https://haru-kazumoto.github.io"],
    credentials: true
}));

app.use(
    session({
        name: "sid",
        secret: process.env.SESSION_SECRET || "veryveryconfidentialsecret",
        resave: false,
        saveUninitialized: false,
        store: new PrismaSessionStore(prisma, {
            checkPeriod: 2 * 60 * 1000, //2 menit aja boy
            dbRecordIdIsSessionId: true,
            dbRecordIdFunction: undefined
        }),
        cookie: {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 1000 * 60 * 60 * 2 //2 jam
        }
    })
)

app.use(passport.initialize());
app.use(passport.session());
configurePassport(passport);

// ROUTES
app.use("/api/v1", authRoutes);

// Contoh endpoint proteksi
app.get("/orders", ensureAuthenticated, async (req, res) => {
    // ... query pakai prisma untuk user req.user.id
    res.json([{ id: 1, item: "Sample" }]);
});

app.get('/check/server', function (req, response) {
    response.send('Server is running');
});

app.get("/check/db", async (req, res) => {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
});

app.listen(PORT, function () {
    console.log("Server is running on port " + PORT);
});