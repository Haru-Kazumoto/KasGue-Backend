import bcrypt from "bcrypt";

export async function hashPassword(password) {
    return await bcrypt.hash(password, 12);
}

export async function comparePassword(raw, hashed) {
    return await bcrypt.compare(raw, hashed);
}