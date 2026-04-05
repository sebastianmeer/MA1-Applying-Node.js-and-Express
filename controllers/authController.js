const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const signToken = (userId) =>
    jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                status: 'fail',
                message: 'Please provide name, email and password',
            });
        }

        // Validate role if provided
        if (role !== undefined && role !== 'user' && role !== 'admin') {
            return res.status(400).json({
                status: 'fail',
                message: "Role must be 'user' or 'admin'",
            });
        }

        const newUser = await User.create({ name, email, password, role });

        const token = signToken(newUser._id);

        res.status(201).json({
            status: 'success',
            token,
            user: {
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            },
        });
    } catch (err) {
        // Duplicate email
        if (err.code === 11000) {
            return res.status(409).json({
                status: 'fail',
                message: 'Email already in use',
            });
        }
        // Mongoose validation error (e.g. password too short)
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                status: 'fail',
                message: err.message,
            });
        }
        res.status(500).json({ status: 'fail', message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                status: 'fail',
                message: 'Please provide email and password',
            });
        }

        // Find user and include password field
        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.correctPassword(password, user.password))) {
            return res.status(401).json({
                status: 'fail',
                message: 'Invalid credentials',
            });
        }

        const token = signToken(user._id);

        res.status(200).json({
            status: 'success',
            token,
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        res.status(500).json({ status: 'fail', message: err.message });
    }
};
