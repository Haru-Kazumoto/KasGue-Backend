export default async function checkUser(req, res, next) {
    if(req.body.user_id) {
        next();
    }
}