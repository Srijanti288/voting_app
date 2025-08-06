const jwt = require('jsonwebtoken');

// 🔒 Middleware to verify token
const jwtAuthMiddleware = (req, res, next) => {
    // Get token from Authorization header: "Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Token not found or Authorization header missing or invalid '
        });
    }
    const token = authHeader.split(' ')[1]; // Get token part
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // Verify token
        req.user = decoded; // save user data (e.g., aadhar no) to the request object (req.user).
        next(); // Proceed to the next middleware/route
    } catch (err) {
        return res.status(401).json({
            error: 'Invalid or expired token'
        });
    }
};

// Function to generate JWT token
const generateToken = (userData) => {
    return jwt.sign(userData, process.env.JWT_SECRET_KEY, {expiresIn: '1h'});
}

module.exports = {
    jwtAuthMiddleware,
    generateToken
};