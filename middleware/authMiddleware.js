const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const cleanToken = (rawToken) =>
    rawToken
        .trim()
        .replace(/^Bearer\s+/i, '')
        .replace(/^["']|["']$/g, '')
        .trim();

const protect = catchAsync(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = cleanToken(req.headers.authorization);
    } else if (req.cookies && req.cookies.jwt) {
        token = cleanToken(req.cookies.jwt);
    }

    if (!token) {
        return next(new AppError('You are not logged in. Please log in to get access.', 401));
    }

    if (token.includes('{{') || token.includes('}}')) {
        return next(new AppError('Postman did not resolve your token variable. Log in or sign up, then paste the returned JWT as the Bearer Token value.', 401));
    }

    if (token === 'undefined' || token === 'null' || token.split('.').length !== 3) {
        return next(new AppError('The Bearer Token value is not a JWT. Use only the token string returned by login or signup, without quotes and without another Bearer prefix.', 401));
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password. Please log in again.', 401));
    }

    req.user = currentUser;
    res.locals.user = currentUser;
    next();
});

const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};

module.exports = { protect, restrictTo };
