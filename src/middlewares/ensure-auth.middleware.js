export default function ensureAuthenticated(req, res, next) {
    // Lewatkan preflight
    if (req.method === 'OPTIONS') return res.sendStatus(204);

    // Debug: lihat method & apakah ada cookie
    // console.log(req.method, req.headers.cookie);

    if (req.isAuthenticated && req.isAuthenticated()) return next();

    return res.status(401).json({
        message: "You must log in to access this resource",
        error: "Unauthorized",
        code: 401
    });
}