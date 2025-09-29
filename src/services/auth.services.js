import * as majorRepository from "../repositories/majors.repository.js";
import * as userRepository from "../repositories/user.repository.js";
import * as passwordUtils from "../utils/password.utils.js"

export default async function register(params) {
    const { username, password, fullname, email, major_id } = params || {}; // type save if there is not body retrieved
    if (!username || !password || !fullname || !email || !major_id) {
        return res.status(400).json({
            message: "Field is required, [EMAIL, PASSWORD, USERNAME, FULLNAME]",
            error: "Bad Request",
            code: 401
        });
    }

    try {
        const password_hash = passwordUtils.hashPassword(password);

        const major = majorRepository.getMajorFromId(major_id);

        if (!major) return res.status(404).json({
            message: "Major tidak ditemukan, " + major_id,
            error: "Not Found",
            code: 404
        });

        const user = userRepository.createUserConnectMajor({
            username,
            email,
            password_hash,
            fullname
        }, major_id);

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
}