const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ status: 'fail', message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return res.status(401).json({ status: 'fail', message: 'Invalid or expired token' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
        return res.status(401).json({ status: 'fail', message: 'Authentication required' });
    }

    req.user = user;
    next();
};

const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'fail',
                message: 'You do not have permission to perform this action',
            });
        }
        next();
    };
};

module.exports = { protect, restrictTo };
