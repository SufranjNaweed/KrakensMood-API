
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
    // Get Token from header
    const token = req.header('auth-jwt');
    // Check if not token
    if(!token){
        return res.status(401).json({
            msg : 'no "auth-jwt", Token authorization denied'
        })
    }
    // if there is a token, verify it
    try{
        const decode = jwt.verify(token, JWT_SECRET);
        req.user = decode.user;
        next();
    }
    catch(err){
        return res.status(401).json({
            msg : "token' isn't valide"
        });
    }
}