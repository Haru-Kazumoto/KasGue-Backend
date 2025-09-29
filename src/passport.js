import { PrismaClient } from "@prisma/client";
import { Strategy } from "passport-local";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export function configurePassport(passport) {
    passport.use(
        new Strategy(
            {
                usernameField: "username",
                passwordField: "password"
            },
            async(username, password, done) => {
                try {
                    const user = await prisma.user.findUnique({where: { username }});
                    if(!user) return done(null, false, { message: "Incorrect username." });

                    const major = await prisma.major.findUnique({where: {id: user.major_id},select: { code: true, name: true }});
                    if(!major) return done(null, false, { message: "Major tidak ditemukan"});

                    const ok = await bcrypt.compare(password, user.password);
                    if(!ok) return done(null, false, { message: "Incorrect password." });

                    return done(null, {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        fullname: user.fullname,
                        major_code: major.code,
                        major_name: major.name
                    });
                } catch (err) {
                    return done(err);
                }
            }
        )
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async(id, done) => {
        try {
            const user = await prisma.user.findUnique({
                where: { id: Number(id) },
                select: {
                    id: true,
                    email: true,
                    fullname: true,
                    major: {
                        select: {
                            code: true,
                            name: true
                        }
                    }
                }
            });

            done(null, user || false);
        } catch(err) {
            done(err);
        }
    });
}